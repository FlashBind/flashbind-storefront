import {SELLER} from '~/config/seller';

/**
 * EU 14-day right of withdrawal (Directive 2011/83/EU, Annex I A and B).
 * DRAFT for LEGAL-001 -- needs legal review. Renders nothing until the
 * seller entity in ~/config/seller is confirmed.
 */
export function EuWithdrawalNotice() {
  if (!SELLER.confirmed) return null;

  const seller = `${SELLER.legalName}, company code ${SELLER.companyCode}, ${SELLER.address}, ${SELLER.email}`;

  return (
    <section id="right-of-withdrawal">
      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Right of withdrawal (EU consumers)</h2>
      <p>
        If you are a consumer, you have the right to withdraw from this contract within 14 days without giving any reason.
        The withdrawal period will expire after 14 days from the day on which you, or a third party other than the carrier
        and indicated by you, acquire physical possession of the goods. If you ordered several goods in one order that are
        delivered separately, the period runs from the day you receive the last item.
      </p>
      <p>
        To exercise the right of withdrawal, you must inform us ({seller}) of your decision to withdraw from this contract
        by an unequivocal statement (e.g. an email). You may use the model withdrawal form below, but it is not obligatory.
        To meet the withdrawal deadline, it is sufficient for you to send your communication before the withdrawal period
        has expired.
      </p>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Effects of withdrawal</h3>
      <p>
        If you withdraw from this contract, we shall reimburse to you all payments received from you, including the costs
        of standard delivery, without undue delay and in any event not later than 14 days from the day on which we are
        informed about your decision to withdraw. We will use the same means of payment as you used for the initial
        transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result.
        We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent
        them back, whichever is earliest.
      </p>
      <p>
        You shall send back the goods to {SELLER.address} without undue delay and in any event not later than 14 days
        from the day on which you communicate your withdrawal to us. You will have to bear the direct cost of returning
        the goods. You are only liable for any diminished value of the goods resulting from handling other than what is
        necessary to establish their nature, characteristics and functioning.
      </p>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Exception</h3>
      <p>
        The right of withdrawal does not apply to goods made to your specifications or clearly personalised, such as
        products printed with your own logo or branding. Our standard products are not personalised and can be withdrawn
        from as described above.
      </p>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Model withdrawal form</h3>
      <p className="text-sm">(Complete and return this form only if you wish to withdraw from the contract.)</p>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm space-y-2">
        <p>To: {seller}</p>
        <p>I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*):</p>
        <p>Ordered on (*) / received on (*):</p>
        <p>Order number:</p>
        <p>Name of consumer(s):</p>
        <p>Address of consumer(s):</p>
        <p>Signature of consumer(s) (only if this form is notified on paper):</p>
        <p>Date:</p>
        <p>(*) Delete as appropriate.</p>
      </div>
    </section>
  );
}
