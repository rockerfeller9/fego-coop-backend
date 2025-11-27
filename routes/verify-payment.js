// ... inside router.route('/verify-payment/:reference').get(...)

router.route('/verify-payment/:reference').get(auth, async (req, res) => {
    const { reference } = req.params;

    try {
        const response = await paystack.verifyTransaction(reference);

        if (response.status && response.data.status === 'success') {
            // Determine the type of payment from Paystack's returned metadata
            const paymentType = response.data.metadata.paymentType; 

            if (paymentType === 'Contribution') {
                const contribution = await Contribution.findOne({ transactionRef: reference });
                if (contribution && contribution.status === 'pending') {
                    contribution.status = 'success';
                    await contribution.save();
                    await User.findByIdAndUpdate(contribution.userId, { $inc: { totalContributions: contribution.amount } });
                    res.json({ msg: 'Payment verified and user contributions updated.' });
                } else { res.json({ msg: 'Contribution already verified or not found.' }); }

            } else if (paymentType === 'Repayment') {
                const repayment = await Repayment.findOne({ transactionRef: reference });
                if (repayment && repayment.status === 'pending') {
                    repayment.status = 'success';
                    await repayment.save();

                    // CRITICAL LOGIC: Reduce the user's current loan balance in the User model
                    await User.findByIdAndUpdate(
                        repayment.userId,
                        { $inc: { currentLoanBalance: -repayment.amount } } // Deduct the amount
                    );

                    // Optional: Check if the loan is fully paid and update the Loan status in the Loan model

                    res.json({ msg: 'Payment verified and user loan balance reduced.' });
                } else { res.json({ msg: 'Repayment already verified or not found.' }); }

            } else {
                res.status(400).json({ msg: 'Unknown payment type verified.' });
            }

        } else {
            res.status(400).json({ msg: 'Payment verification failed.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during payment verification.');
    }
});
