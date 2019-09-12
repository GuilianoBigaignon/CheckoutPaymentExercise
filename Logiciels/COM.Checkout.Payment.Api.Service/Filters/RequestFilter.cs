using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Newtonsoft.Json;
using COM.Checkout.Payment.Api.Contract.DTO.MessageRequest;
using COM.Checkout.Payment.Api.Service.Common;

namespace COM.Checkout.Payment.Api.Service.Filters
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class RequestFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            String msgError = String.Empty;
            bool isValidate = true;
            System.Web.Http.ModelBinding.ModelStateDictionary model = new System.Web.Http.ModelBinding.ModelStateDictionary();
            try
            {
                PaymentRequestDTO paymentRepresentationModel = new PaymentRequestDTO();
                CardDetailsRequestDTO cardRepresentationModel = new CardDetailsRequestDTO();
                PaymentConfirmationRequestDTO paymentConfRepresentationModel = new PaymentConfirmationRequestDTO();

                try
                {
                    paymentRepresentationModel = actionContext.ActionArguments["req"] as PaymentRequestDTO;
                }
                catch
                {
                    paymentRepresentationModel = null;
                };

                try
                {
                    paymentConfRepresentationModel = actionContext.ActionArguments["req"] as PaymentConfirmationRequestDTO;
                }
                catch
                {
                    paymentConfRepresentationModel = null;
                };

                try
                {
                    cardRepresentationModel = actionContext.ActionArguments["req"] as CardDetailsRequestDTO;
                }
                catch
                {
                    cardRepresentationModel = null;
                };
                
                model = actionContext.ModelState;
                msgError = "*** BAD REQUEST *** (" + actionContext.ActionDescriptor.ActionName + ") ";

                // Test BAD REQUEST (400)
                if (!model.IsValid)
                {
                    msgError += string.Join(",",
                        model.Values.Where(e => e.Errors.Count > 0)
                                    .SelectMany(e => e.Errors)
                                    .Select(e => e.ErrorMessage)
                                    .ToArray());

                    msgError += string.Join(",",
                     model.SelectMany(e => e.Value.Errors)
                                 .Where(e => e.Exception != null)
                                 .Select(e => e.Exception.Message)
                                 .ToArray());
                }
                else
                {

                    if (paymentRepresentationModel != null)
                    {
                        isValidate = ((paymentRepresentationModel.Amount != 0) && (paymentRepresentationModel.bearer.Any()) && (paymentRepresentationModel.CardNumber.Any()) && (paymentRepresentationModel.CvvCode != 0) /*Add more validation*/);

                        if (isValidate)
                        {
                            try
                            {
                                string jsonFormat = JsonConvert.SerializeObject(paymentRepresentationModel);
                            }
                            catch (JsonSerializationException e)
                            {
                                msgError += "Erreur :" + e.Message + ". Champs manquants";
                                isValidate = false;
                            }
                        }
                        else
                        {
                            msgError += "Format JSON erroné";
                        }
                    }

                    if (paymentConfRepresentationModel != null)
                    {
                        isValidate = ((paymentRepresentationModel.Amount != 0) && (paymentConfRepresentationModel.bearer.Any()) && (paymentConfRepresentationModel.CardNumber.Any()) && (paymentConfRepresentationModel.CvvCode != 0) /*Add more validation*/);

                        if (isValidate)
                        {
                            try
                            {
                                string jsonFormat = JsonConvert.SerializeObject(paymentConfRepresentationModel);
                            }
                            catch (JsonSerializationException e)
                            {
                                msgError += "Erreur :" + e.Message + ". Champs manquants";
                                isValidate = false;
                            }
                        }
                        else
                        {
                            msgError += "Format JSON erroné";
                        }
                    }

                    if (cardRepresentationModel != null && paymentRepresentationModel == null)
                    // PaymentRepresentation comprend CardRepresentation + Amount + Currency 
                    //==> On considere un CardRepresentationEntity uniquement si la requete n'a pas ete identifiee comme PaymentRepresentation
                    {
                        isValidate = ((paymentRepresentationModel.bearer.Any()) && (paymentRepresentationModel.CardNumber.Any()) || (paymentRepresentationModel.CvvCode != 0) /*Add more validation*/);

                        if (isValidate)
                        {
                            try
                            {
                                string jsonFormat = JsonConvert.SerializeObject(cardRepresentationModel);
                            }
                            catch (JsonSerializationException e)
                            {
                                msgError += "Erreur :" + e.Message + ". Champs manquants";
                                isValidate = false;
                            }
                        }
                        else
                        {
                            msgError += "Format JSON erroné";
                        }
                    }
                }
                if (!model.IsValid || !isValidate)
                {
                    throw new HttpResponseException(new HttpResponseMessage
                    {
                        StatusCode = HttpStatusCode.BadRequest,
                        Content = new StringContent(msgError),
                        ReasonPhrase = Utils.CleanNewLine(msgError)
                    });
                }
            }
            catch (HttpResponseException ex)
            {
                //LoggerService.Instance.LogFatal("RequestFilter.OnActionExecuting", "Model non valide," + msgError);
                throw ex;
            }
            catch (Exception ex)
            {
                //LoggerService.Instance.LogFatal("RequestFilter.OnActionExecuting", "Erreur de traitement: " + ex.Message);
                throw new HttpResponseException(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.BadRequest,
                    Content = new StringContent(ex.Message),
                    ReasonPhrase = Utils.CleanNewLine(msgError)
                });
            }
            base.OnActionExecuting(actionContext);
        }

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            base.OnActionExecuted(actionExecutedContext);

            var ctx = actionExecutedContext.ActionContext.Request.Properties.Where(a => a.Key == "REQUEST_ID").Select(a => a.Value).FirstOrDefault();

            var ex = actionExecutedContext.Exception;

            // INTERNAL SERVER ERROR (500)
            if (ex != null)
            {
                String msg = ex.Message;
                if (ex.InnerException != null) msg += " " + ex.InnerException.Message;

                var Response = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Content = new StringContent(msg),
                    ReasonPhrase = Utils.CleanNewLine(msg)
                };
                // Save err5xx with context data into err5xx file for later analysis (one file only for all err500 errors - no need to scan every file for errors)
                //LoggerService.Instance.LogDebug("RequestFilter.OnActionExecuting", "*** UNHANDLED *** {0} {1}- {2}\r\n REQUEST : {3}" + actionExecutedContext.ActionContext.ActionDescriptor.ActionName +
                //                                                   ctx ?? String.Empty,
                //                                                   Response.ReasonPhrase,
                //                                                   string.Join(",",
                //                                                        actionExecutedContext.ActionContext.ActionArguments.Select(a => string.Format("{0}={1}", a.Key,
                //                                                          Utils.CleanNewLine(JsonConvert.SerializeObject(a.Value))))));

                throw new HttpResponseException(Response);
            }
        }
    }
}
