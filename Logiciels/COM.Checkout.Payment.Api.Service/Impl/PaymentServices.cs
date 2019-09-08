using Framework.Database;
using System;
using System.Net;
using System.Net.Http;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using COM.Checkout.Payment.Entity.Impl;

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
                return InitiatePayment(paymentDTO);
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
        public HttpResponseMessage GetPayment(PaymentConfirmationRequestDTO paymentConfirmationDTO)
        {
            HttpResponseMessage httpResponseMessage = new HttpResponseMessage();

            try
            {                
                return GetPaymentDetails(paymentConfirmationDTO.TransactionConfirmationCode);
            }
            catch (Exception ex)
            {
                httpResponseMessage.StatusCode = HttpStatusCode.InternalServerError;
                httpResponseMessage.Content = new StringContent("{'error' :'" + ex.Message + "'");
                return httpResponseMessage;
            }
        }


        #region API utils

            static HttpClient client = new HttpClient();
        
            static async Task<HttpResponseMessage> InitiatePayment(PaymentRequestDTO paymentDTO)
            {
                HttpResponseMessage response = await client.PostAsJsonAsync(
                    "api/products", paymentDTO);
                response.EnsureSuccessStatusCode();

                // return URI of the created resource.
                return response;
            }

            static async Task<PaymentConfirmationRequestDTO> GetPaymentDetails(string TransactionConfirmationCode)
            {
            PaymentConfirmationEntity paymentConf = null;
                HttpResponseMessage response = await client.GetAsync(TransactionConfirmationCode);

                if (response.IsSuccessStatusCode)
                {
                paymentConf = await response.Content.ReadAsAsync<PaymentConfirmationRequestDTO>();
                }
                return paymentConf;
            }
            static void Main()
            {
                RunAsync().GetAwaiter().GetResult();
            }

            static async Task RunAsync()
            {
            //    // Update port # in the following line.
            //    client.BaseAddress = new Uri("http://localhost:64195/");  //TODO : Creer un banking API Fake et mettre l'adresse ici 
            //client.DefaultRequestHeaders.Accept.Clear();
            //    client.DefaultRequestHeaders.Accept.Add(
            //        new MediaTypeWithQualityHeaderValue("application/json"));

            //    try
            //    {
            //        // Create a new product
            //        Product product = new Product
            //        {
            //            Name = "Gizmo",
            //            Price = 100,
            //            Category = "Widgets"
            //        };

            //        var url = await CreateProductAsync(product);
            //        Console.WriteLine($"Created at {url}");

            //        // Get the product
            //        product = await GetProductAsync(url.PathAndQuery);
            //        ShowProduct(product);

            //        // Update the product
            //        Console.WriteLine("Updating price...");
            //        product.Price = 80;
            //        await UpdateProductAsync(product);

            //        // Get the updated product
            //        product = await GetProductAsync(url.PathAndQuery);
            //        ShowProduct(product);
                
                }
                catch (Exception e)
                {
                  throw; 
                }
            
            }
        }
    }

    #endregion
}
}
