using System;

namespace COM.Checkout.Payment.Entity.Impl
{
    [Serializable]
    public class PaymentConfirmationEntity : PaymentRequestEntity
    {
        /// <summary>
        /// Transaction confirmation code
        public string TransactionConfirmationCode { get; set; }

        /// <summary>
        /// Transaction date and time
        /// </summary>
        public DateTime TransactionTime { get; set; }
    }
}
