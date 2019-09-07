using System;
using System.Collections.Generic;

namespace COM.Checkout.Payment.Api.Service.Impl
{
    public class CommonServices : ICommonServices
    {        
        public CommonServices()
        {

        }

        /// <summary>
        /// Get master Version
        /// </summary>
        /// <returns></returns>
        public String GetVersion()
        {            
            return "1.0";
        }

        /// <summary>
        /// Get versions of all components
        /// </summary>
        /// <returns></returns>
        public List<String> GetVersions()
        {
            return new List<string>();
        }

        /// <summary>
        /// Check Database Availability
        /// </summary>
        /// <returns></returns>
        public String CheckAvailability()
        {
            return "OK";            
        }
    }
}
