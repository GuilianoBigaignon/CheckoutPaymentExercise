using Newtonsoft.Json;
using System;
using System.Runtime.Serialization;

namespace COM.Checkout.Payment.Api.Contract.DTO.MessageRequest
{
    [Serializable]
    public class PaymentRequestDTO : CardDetailsRequestDTO
    {
        /// <summary>
        /// Currency
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "currency", IsRequired = true)]
        public string Currency { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        [JsonProperty(Required = Required.Always)]
        [DataMember(Name = "amount", IsRequired = true)]
        public int Amount { get; set; }
    }
}
