using System;
using System.Collections.Generic;

namespace COM.Checkout.Payment.Entity.Impl
{
    [Serializable]
    public class CardEntity
    {
        /// <summary>
        /// Application verseion
        /// </summary>
        public int Version { get; set; }

        /// <summary>
        /// Unique payment identifier
        /// </summary>
        public string PaymentID { get; set; }

        /// <summary>
        /// Authentication Token
        /// </summary>
        public string AuthenticationToken { get; set; }

        /// <summary>
        /// Payment card number
        /// </summary>
        public string CardNumber { get; set; }

        /// <summary>
        /// Payment card issuer
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// Payment card bearer
        /// </summary>
        public string bearer { get; set; }

        /// <summary>
        /// Payment card max validity month
        /// </summary>
        public int ExpiryMonth { get; set; }

        /// <summary>
        /// Payment card max validity year
        /// </summary>
        public int ExpiryYear { get; set; }

        /// <summary>
        /// Payment card CVV code. Some cards do not require this.
        /// </summary>
        public int CvvCode { get; set; }

    }
}
