using System.Reflection;
using System.Web.Http;
using log4net;
using System.Web.Http.Description;
using System.Net.Http;
using System.Net;
using System;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using COM.Checkout.Payment.Api.Service;

namespace COM.Checkout.Payment.Api.Controllers
{
    /// <summary>
    /// Liste DV Controller
    /// </summary>
    public class PaymentController : BaseController
    {
        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IPaymentServices _paymentServices;

        /// <summary>
        /// Liste DV Constructeur
        /// </summary>
        /// <param name="paymentServices"></param>
        /// <param name="commonServices"></param>
        public PaymentController(IPaymentServices paymentServices, ICommonServices commonServices) : base(commonServices)
        {
            _paymentServices = paymentServices;
        }

        /// <summary>
        /// Payment
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("OnlinePayment/Payment")]
        [ResponseType(typeof(PaymentRequestDTO))]
        public IHttpActionResult Payment([FromBody] PaymentRequestDTO req)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            PaymentRequestDTO paymentRequest = null;
            try
            {
                paymentRequest = _paymentServices.DoPayment(req);
            }
            catch (Exception ex)
            {
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.Content = new StringContent(ex.Message);
            }
            return Ok(paymentRequest);
        }
    
    /// <summary>
    /// Confirm
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost]
    [Route("OnlinePayment/Confirm")]
    [ResponseType(typeof(PaymentRequestDTO))]
    public IHttpActionResult Confirm([FromBody] PaymentConfirmationRequestDTO req)
    {
            PaymentConfirmationRequestDTO paymentConfirmation = new PaymentConfirmationRequestDTO();

            try
            {
                paymentConfirmation = _paymentServices.GetPaymentDetails(req);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Ok(paymentConfirmation);
        }
    }
}