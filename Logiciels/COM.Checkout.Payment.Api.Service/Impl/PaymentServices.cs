using System;
using System.Net;
using System.Net.Http;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using COM.Checkout.Payment.Api.Service.Common.Net.Http;
using System.ComponentModel.Composition;

namespace COM.Checkout.Payment.Api.Service.Impl
{
    [Export(typeof(IPaymentServices))]
    //[Export(typeof(ITicketingCalculator))]
    [ExportMetadata("Name", "Smirt")]
    [System.ComponentModel.Composition.PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
    public class PaymentServices : IPaymentServices
    {   
        public PaymentServices()
        {    
                    
        }

        /// <summary>
        /// Initiate an online payment
        /// </summary>
        public PaymentRequestDTO DoPayment(PaymentRequestDTO paymentDTO)
        {
            HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
            try
            {
                //httpResponseMessage.Content
                return InitiatePayment(paymentDTO);
            }
            catch (Exception ex)
            {
                //httpResponseMessage.StatusCode = HttpStatusCode.InternalServerError;
                //httpResponseMessage.Content = new StringContent(ex.Message);
                return null;
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
                return GetPaymentDetails(paymentConfirmationDTO);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #region API utils

        static HttpClient client = new HttpClient();

        public PaymentRequestDTO InitiatePayment(PaymentRequestDTO paymentDTO)
        {
            //HttpResponseMessage response = await client.PostAsJsonAsync("BankPayment/Payment", paymentDTO);

            PaymentRequestDTO result = webApiHttpClient.RequestPost<PaymentRequestDTO, PaymentRequestDTO>("/BankPayment/Payment", paymentDTO); //Authentication not added due to time constraint

            return result;

            //response.EnsureSuccessStatusCode();            
            //return response;
        }

        public PaymentConfirmationRequestDTO GetPaymentDetails(PaymentConfirmationRequestDTO paymentConfirmation)
        {
            PaymentConfirmationRequestDTO paymentConf = webApiHttpClient.RequestPost<PaymentConfirmationRequestDTO, PaymentConfirmationRequestDTO>("/BankPayment/Confirm", paymentConfirmation); //Authentication not added due to time constraint
            
            //HttpResponseMessage response = await client.GetAsync($"BankPayment/Payment/{TransactionConfirmationCode}");

            //if (response.IsSuccessStatusCode)
            //{
            //    paymentConf = await response.Content.ReadAsAsync<PaymentConfirmationRequestDTO>();
            //}
            return paymentConf;
        }

        private static WebApiHttpClient webApiHttpClient = null;

        static PaymentServices()
        {
            if (webApiHttpClient == null)
            {
                webApiHttpClient = new WebApiHttpClient();
                webApiHttpClient.BaseAddress = new Uri(Consts.BankURL);
                webApiHttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            }
        }

        #endregion

    }
}
