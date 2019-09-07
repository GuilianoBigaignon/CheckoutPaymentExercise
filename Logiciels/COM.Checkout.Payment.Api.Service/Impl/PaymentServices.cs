using Framework.Database;
using System;
using System.Net;
using System.Net.Http;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;

namespace COM.Checkout.Payment.Api.Service.Impl
{
    public class PaymentServices : IPaymentServices
    {       

        public PaymentServices()
        {            
        }

        /// <summary>
        /// Initiate an online payment
        /// </summary>
        public HttpResponseMessage DoPayment(PaymentRequestDTO paymentDTO)
        {
            HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
            try
            {
                //TODO:Add call to banking app
                httpResponseMessage.StatusCode = HttpStatusCode.OK;

                return httpResponseMessage;
            }
            catch (Exception ex)
            {   httpResponseMessage.StatusCode = HttpStatusCode.InternalServerError;
                httpResponseMessage.Content = new StringContent(ex.Message);
                return httpResponseMessage;
            }
        }

        /// <summary>
        /// Retrieve payment info
        /// </summary>
        public HttpResponseMessage GetPayment(PaymentConfirmationRequestDTO paymentConfirmationDTO)
        {
            HttpResponseMessage httpResponseMessage = new HttpResponseMessage();

            try
            {
                //TODO:Add bank service call
                httpResponseMessage.StatusCode = HttpStatusCode.OK;
                return httpResponseMessage;

            }
            catch (Exception ex)
            {
                httpResponseMessage.StatusCode = HttpStatusCode.InternalServerError;
                httpResponseMessage.Content = new StringContent("{'error' :'" + ex.Message + "'");
                return httpResponseMessage;
            }
        }
    }
}
