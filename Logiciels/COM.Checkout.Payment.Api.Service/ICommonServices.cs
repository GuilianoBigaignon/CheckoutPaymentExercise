using System;
using System.Collections.Generic;

namespace COM.Checkout.Payment.Api.Service
{
    public interface ICommonServices
    {
        String GetVersion();

        List<String> GetVersions();

        String CheckAvailability();
    }
}
