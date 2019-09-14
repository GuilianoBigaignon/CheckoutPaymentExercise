using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace COM.Checkout.Payment.Api.Service.Common.Net.Http
{
    /// <summary></summary>
    public class WebApiHttpClient : HttpClient
    {
        /// <summary></summary>
        public static readonly string API_KEY_PREFIX = "ApiKey-";
        /// <summary></summary>
        public static readonly string COOKIE_NAME_AUTH_TOKEN = "XAuthToken";
        private readonly string apiKey;

        /// <summary></summary>
        public WebApiHttpClient() : base(new HttpClientHandler { UseCookies = false })
        {

        }

        /// <summary></summary>
        public WebApiHttpClient(string apiKey, string proxyUrl) :
            base(new HttpClientHandler()
            {
                Proxy = new WebProxy(proxyUrl, false),
                UseProxy = true,
                UseCookies = false
            })
        {
            this.apiKey = apiKey;
        }

        /// <summary></summary>
        public WebApiHttpClient(string apiKey) : base(new HttpClientHandler { UseCookies = false })
        {
            this.apiKey = apiKey;
        }

        /// <summary></summary>
        public WebApiHttpClient(CookieContainer cookieContainer) :
            base(new HttpClientHandler()
            {
                CookieContainer = cookieContainer
            })
        {

        }

        /// <summary></summary>
        public MediaTypeFormatter[] MediaTypeFormatter { get; private set; } = new MediaTypeFormatter[]
        {
            new BinaryMediaTypeFormatter(),
            new JsonMediaTypeFormatter() { SerializerSettings = { TypeNameHandling = TypeNameHandling.Auto, ContractResolver = new DefaultContractResolver { IgnoreSerializableAttribute = true } } }
        };

        private static IDictionary<string, string> ToKeyValue(object metaToken)
        {
            if (metaToken == null)
            {
                return null;
            }

            JToken token = metaToken as JToken;
            if (token == null)
            {
                return ToKeyValue(JObject.FromObject(metaToken));
            }

            if (token.HasValues)
            {
                var contentData = new Dictionary<string, string>();
                foreach (var child in token.Children().ToList())
                {
                    var childContent = ToKeyValue(child);
                    if (childContent != null)
                    {
                        contentData = contentData.Concat(childContent)
                                                 .ToDictionary(k => k.Key, v => v.Value);
                    }
                }

                return contentData;
            }

            var jValue = token as JValue;
            if (jValue?.Value == null)
            {
                return null;
            }

            var value = jValue?.Type == JTokenType.Date ?
                            jValue?.ToString("o", CultureInfo.InvariantCulture) :
                            jValue?.ToString(CultureInfo.InvariantCulture);

            return new Dictionary<string, string> { { token.Path, value } };
        }

        /// <summary></summary>
        public static string GetUrlEncodedString(object obj)
        {
            if (obj == null) return string.Empty;

            var keyValueContent = ToKeyValue(obj) ?? new Dictionary<string, string>();
            var formUrlEncodedContent = new FormUrlEncodedContent(keyValueContent);

            return "?" + formUrlEncodedContent.ReadAsStringAsync().Result;
        }

        private HttpResponseMessage RequestPost<REQ>(string ressource, REQ requestParam, string token, int? version)
        {
            try
            {
                HttpResponseMessage response = this.SendAsync(CreateJsonRequest(ressource, HttpMethod.Post, requestParam, token, version)).Result;

                if (!response.IsSuccessStatusCode)
                {
                    HandleError(response);
                }

                return response;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary></summary>
        public RES RequestPost<REQ, RES>(string ressource, REQ requestParam, string token = null, int? version = null)
        {
            try
            {
                HttpResponseMessage response = RequestPost(ressource, requestParam, token, version);
                return response.Content.ReadAsAsync<RES>(MediaTypeFormatter).Result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private HttpResponseMessage RequestPut<REQ>(string ressource, REQ requestParam, string token, int? version)
        {
            try
            {
                HttpResponseMessage response = this.SendAsync(CreateJsonRequest(ressource, HttpMethod.Put, requestParam, token, version)).Result;

                if (!response.IsSuccessStatusCode)
                {
                    HandleError(response);
                }

                return response;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary></summary>
        public RES RequestPut<REQ, RES>(string ressource, REQ requestParam, string token = null, int? version = null)
        {
            try
            {
                HttpResponseMessage response = RequestPut(ressource, requestParam, token, version);
                return response.Content.ReadAsAsync<RES>().Result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private HttpResponseMessage RequestDelete<REQ>(string ressource, REQ requestParam, string token, int? version)
        {
            try
            {
                string queryString = GetUrlEncodedString(requestParam);
                HttpResponseMessage response = this.SendAsync(CreateJsonRequest(ressource + queryString, HttpMethod.Delete, token, version)).Result;

                if (!response.IsSuccessStatusCode)
                {
                    HandleError(response);
                }

                return response;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary></summary>
        public RES RequestDelete<REQ, RES>(string ressource, REQ requestParam, string token = null, int? version = null)
        {
            try
            {
                HttpResponseMessage response = RequestDelete(ressource, requestParam, token, version);
                return response.Content.ReadAsAsync<RES>().Result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private HttpResponseMessage RequestGet<REQ>(string ressource, REQ requestParam, string token, int? version)
        {
            try
            {
                string queryString = GetUrlEncodedString(requestParam);
                HttpResponseMessage response = this.SendAsync(CreateJsonRequest(ressource + queryString, HttpMethod.Get, token, version)).Result;

                if (!response.IsSuccessStatusCode)
                {
                    HandleError(response);
                }

                return response;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary></summary>
        public RES RequestGet<REQ, RES>(string ressource, REQ requestParam, string token = null, int? version = null)
        {
            try
            {
                HttpResponseMessage response = RequestGet(ressource, requestParam, token, version);
                return response.Content.ReadAsAsync<RES>(MediaTypeFormatter).Result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary></summary>
        public RES RequestGet<RES>(string ressource, string token = null)
        {
            return RequestGet<object, RES>(ressource, null, token);
        }

        public RES SendRequest<REQ, RES>(string route, HttpVerbs httpVerb, REQ param, string token = null, int? version = null)
        {
            switch (httpVerb)
            {
                case HttpVerbs.Get:
                    return RequestGet<REQ, RES>(route, param, token, version);
                case HttpVerbs.Post:
                    return RequestPost<REQ, RES>(route, param, token, version);
                case HttpVerbs.Put:
                    return RequestPut<REQ, RES>(route, param, token, version);
                case HttpVerbs.Delete:
                    return RequestDelete<REQ, RES>(route, param, token, version);
                case HttpVerbs.Head:
                case HttpVerbs.Patch:
                case HttpVerbs.Options:
                    return default(RES);
                default:
                    return default(RES);
            }
        }

        private void HandleError(HttpResponseMessage response)
        {
            try
            {
                ExceptionResponse exceptionResponse = response.ExceptionResponse().Result;
                throw new WebApiClientException(response.StatusCode, exceptionResponse);
            }
            catch (WebApiClientException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private HttpRequestMessage CreateJsonRequest(string url, HttpMethod method, string token, int? version)
        {
            var request = new HttpRequestMessage { RequestUri = new Uri(this.BaseAddress + url) };
            request.Headers.Accept.Clear();
            var mediaType = new MediaTypeWithQualityHeaderValue("application/json");
            if (version.HasValue)
            {
                mediaType.Parameters.Add(new NameValueHeaderValue("version", version.ToString()));
            }
            request.Headers.Accept.Add(mediaType);
            request.Method = method;
            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Add("Cookie", AuthTokenCookie(token));
            }
            else
            {
                if (!string.IsNullOrEmpty(apiKey))
                {
                    request.Headers.Add("Cookie", AuthTokenCookie(apiKey));
                }
            }
            return request;
        }

        private HttpRequestMessage CreateJsonRequest<T>(string url, HttpMethod method, T content, string token, int? version)
        {
            HttpRequestMessage request = CreateJsonRequest(url, method, token, version);
            request.Content = new ObjectContent<T>(content, new JsonMediaTypeFormatter() { SerializerSettings = { TypeNameHandling = TypeNameHandling.All, ContractResolver = new DefaultContractResolver { IgnoreSerializableAttribute = true } } });
            return request;
        }

        private string AuthTokenCookie(string token)
        {
            return $"{COOKIE_NAME_AUTH_TOKEN}={token}";
        }
    }

    /// <summary></summary>
    public class WebApiClientException : Exception
    {
        /// <summary></summary>
        public HttpStatusCode StatusCode { get; }

        /// <summary></summary>
        public ExceptionResponse ExceptionResponse { get; }

        /// <summary></summary>
        public WebApiClientException(HttpStatusCode statusCode, ExceptionResponse exceptionResponse)
        {
            StatusCode = statusCode;
            ExceptionResponse = exceptionResponse;
        }

        /// <summary></summary>
        public WebApiClientException(string message) : base(message)
        {

        }
    }

    /// <summary></summary>
    public static class HttpResponseMessageExtension
    {
        /// <summary></summary>
        public static async Task<ExceptionResponse> ExceptionResponse(this HttpResponseMessage httpResponseMessage)
        {
            string responseContent = await httpResponseMessage.Content.ReadAsStringAsync();

            ExceptionResponse exceptionResponse;

            try
            {
                exceptionResponse = JsonConvert.DeserializeObject<ExceptionResponse>(responseContent);
            }
            catch (Exception e)
            {
                exceptionResponse = new Http.ExceptionResponse
                {
                    ExceptionMessage = "HttpStatus: " + httpResponseMessage.ReasonPhrase,
                    StackTrace = responseContent
                };
            }

            return exceptionResponse;
        }
    }

    /// <summary></summary>
    public class ExceptionResponse
    {
        /// <summary></summary>
        public string Message { get; set; }
        /// <summary></summary>
        public string ExceptionMessage { get; set; }
        /// <summary></summary>
        public string ExceptionType { get; set; }
        /// <summary></summary>
        public string StackTrace { get; set; }
        /// <summary></summary>
        public ExceptionResponse InnerException { get; set; }
    }
}
