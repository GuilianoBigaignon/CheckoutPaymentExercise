using System;

namespace COM.Checkout.Payment.Entity.Impl
{
    [Serializable]
    public class PaymentRequestEntity : CardEntity
    {
        /// <summary>
        /// Currency
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        public int Amount { get; set; }
    }
}
