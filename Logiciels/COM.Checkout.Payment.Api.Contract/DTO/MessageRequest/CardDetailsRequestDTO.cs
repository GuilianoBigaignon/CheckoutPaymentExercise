using Newtonsoft.Json;
using System;
using System.Runtime.Serialization;

namespace COM.Checkout.Payment.Api.Contract.DTO.MessageRequest
{
    [Serializable]
    [DataContract]
    public class CardDetailsRequestDTO
    {
        /// <summary>
        /// Application verseion
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "version", IsRequired = true)]
        public int Version { get; set; }
     
        /// <summary>
        /// Unique payment identifier
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "paymentID",  IsRequired = true)]
        public string PaymentID { get; set; }

        /// <summary>
        /// Authentication Token
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "authenticationToken", IsRequired = true)]
        public string AuthenticationToken { get; set; }

        /// <summary>
        /// Payment card number
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "cardNumber", IsRequired = true)]
        public string CardNumber { get; set; }

        /// <summary>
        /// Payment card issuer
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "issuer", IsRequired = true)]
        public string Issuer { get; set; }

        /// <summary>
        /// Payment card bearer
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "bearer", IsRequired = true)]
        public string bearer { get; set; }

        /// <summary>
        /// Payment card max validity month
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "expiryMonth", IsRequired = true)]
        public int ExpiryMonth { get; set; }

        /// <summary>
        /// Payment card max validity year
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "expiryYear", IsRequired = true)]
        public int ExpiryYear { get; set; }

        /// <summary>
        /// Payment card CVV code. Some cards do not require this.
        /// </summary>
        [JsonProperty(Required = Required.AllowNull)]
        [DataMember(Name = "cvvCode", IsRequired = false)]
        public int CvvCode { get; set; }
    }
}
