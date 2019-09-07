using Newtonsoft.Json;
using System;
using System.Runtime.Serialization;

namespace COM.Checkout.Payment.Api.Contract.DTO.MessageRequest
{
    [Serializable]
    public class PaymentConfirmationRequestDTO : PaymentRequestDTO
    {
        /// <summary>
        /// Transaction confirmation code
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "transactionConfirmationCode", IsRequired = true)]
        public string TransactionConfirmationCode { get; set; }

        /// <summary>
        /// Transaction date and time
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "transactionTime", IsRequired = true)]
        public DateTime TransactionTime { get; set; }
    }
}
