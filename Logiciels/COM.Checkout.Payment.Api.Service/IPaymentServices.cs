using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using Framework.Database;
using System.Net.Http;

namespace COM.Checkout.Payment.Api.Service
{
    /// <summary>
    /// Payment module
    /// </summary>
    public interface IPaymentServices
    {
        /// <summary>
        /// Initiate an online payment
        /// </summary>
        HttpResponseMessage DoPayment(PaymentRequestDTO paymentDTO);

        /// <summary>
        /// Retrieve payment info
        /// </summary>
        PaymentConfirmationRequestDTO GetPayment(PaymentConfirmationRequestDTO paymentConfirmationDTO);
    }
}
