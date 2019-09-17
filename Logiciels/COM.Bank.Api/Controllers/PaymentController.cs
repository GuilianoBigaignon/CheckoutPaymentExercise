using System.Reflection;
using System.Web.Http;
using log4net;
using System.Web.Http.Description;
using System.Net.Http;
using System.Net;
using System;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using COM.Checkout.Payment.Api.Service;

namespace COM.Bank.Api.Controllers
{
    /// <summary>
    /// Liste DV Controller
    /// </summary>
    public class BankController : BaseController
    {
        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IPaymentServices _paymentServices;

        /// <summary>
        /// Liste DV Constructeur
        /// </summary>
        /// <param name="paymentServices"></param>
        /// <param name="commonServices"></param>
        public BankController(IPaymentServices paymentServices, ICommonServices commonServices) : base(commonServices)
        {
            _paymentServices = paymentServices;
        }

        /// <summary>
        /// Payment
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BankPayment/Payment")]
        [ResponseType(typeof(PaymentRequestDTO))]
        public HttpResponseMessage Payment([FromBody] PaymentRequestDTO req)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            try
            {
                req.CardNumber = "***" + req.CardNumber.Substring(req.CardNumber.Length-3); //Mask the creditcard numder and resend objet as IS since it is a mock
                response = Request.CreateResponse(HttpStatusCode.OK, req);
            }
            catch (Exception ex)
            {
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.Content = new StringContent(ex.Message);
            }
            return response;
        }
    
    /// <summary>
    /// Confirm
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost]
    [Route("BankPayment/Confirm")]
    [ResponseType(typeof(PaymentConfirmationRequestDTO))]
    public IHttpActionResult Confirm([FromBody] PaymentConfirmationRequestDTO req)
    {
            PaymentConfirmationRequestDTO paymentConfirmation = new PaymentConfirmationRequestDTO();

            try
            {
                req.CardNumber = "***" + req.CardNumber.Substring(req.CardNumber.Length - 3); //Mask the creditcard numder and resend objet as IS since it is a mock                
                paymentConfirmation = req;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Ok(paymentConfirmation);
        }
    }
}