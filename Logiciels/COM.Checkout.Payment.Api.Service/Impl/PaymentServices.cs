using System;
using System.Net;
using System.Net.Http;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using System.Threading.Tasks;
using System.Net.Http.Headers;

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
                return InitiatePayment(paymentDTO).Result;
            }
            catch (Exception ex)
            {
                httpResponseMessage.StatusCode = HttpStatusCode.InternalServerError;
                httpResponseMessage.Content = new StringContent(ex.Message);
                return httpResponseMessage;
            }
        }

        /// <summary>
        /// Retrieve payment info
        /// </summary>
        public PaymentConfirmationRequestDTO GetPayment(PaymentConfirmationRequestDTO paymentConfirmationDTO)
        {
            HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
            try
            {                
                return GetPaymentDetails(paymentConfirmationDTO.TransactionConfirmationCode).Result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #region API utils

        static HttpClient client = new HttpClient();

        static async Task<HttpResponseMessage> InitiatePayment(PaymentRequestDTO paymentDTO)
        {
            PrepareClient();

            HttpResponseMessage response = await client.PostAsJsonAsync("BankPayment/Payment", paymentDTO);
            response.EnsureSuccessStatusCode();            
            return response;
        }

        static async Task<PaymentConfirmationRequestDTO> GetPaymentDetails(string TransactionConfirmationCode)
        {
            PaymentConfirmationRequestDTO paymentConf = null;

            PrepareClient();
            HttpResponseMessage response = await client.GetAsync(TransactionConfirmationCode);

            if (response.IsSuccessStatusCode)
            {
                paymentConf = await response.Content.ReadAsAsync<PaymentConfirmationRequestDTO>();
            }
            return paymentConf;
        }

        static void PrepareClient()
        {
            // Update port # in the following line.
            client.BaseAddress = new Uri(Consts.BankURL);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        #endregion

    }
}
