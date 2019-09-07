using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace COM.Checkout.Payment.Api.Service.Common
{
    public static class Utils
  {
    /// <summary>
    /// Convert UInt32 to list 
    /// </summary>
    /// <param name="data"></param>
    /// <returns></returns>
    public static List<UInt32> ConvertUInt32ToList(UInt32 data)
    {
      List<UInt32> lst = new List<uint>();
      UInt32 mask = 1;
      for (int i = 0; i < sizeof(UInt32) * 8; i++)
      {
        if ((data & mask << i) != 0)
          lst.Add((uint)i + 1);
      }
      return lst;
    }

    /// <summary>
    /// Save binary value as a string of '1' and '0'
    /// Convert Integer to binary and return as string
    /// </summary>
    /// <param name="n"></param>
    /// <returns></returns>
    public static string ConvertUInt32ToString(UInt32 n)
    {
      char[] b = new char[sizeof(UInt32) * 8];

      for (int i = 0; i < b.Length; i++)
        b[b.Length - 1 - i] = ((n & (1 << i)) != 0) ? '1' : '0';

      return new string(b).TrimStart('0');
    }

    /// <summary>
    /// Convert Hex representation into uint 
    /// </summary>
    /// <param name="n"></param>
    /// <returns></returns>
    public static uint ConvertToApiStruct(uint n)
    {
      return (uint)Convert.ToUInt32(n.ToString(), 16);
    }

    /// <summary>
    /// Convert uint into HEX representation
    /// </summary>
    /// <param name="n"></param>
    /// <returns></returns>
    public static uint ConvertFromApiStruct(uint n)
    {
      return Convert.ToUInt32(n.ToString("X"));
    }

    /// <summary>
    /// Serialize an object to Json without empty properties, on single line
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    public static String CleanSerialize(object req)
    {
      return CleanNewLine(JsonConvert.SerializeObject(req,
        new JsonSerializerSettings
        {
          NullValueHandling = NullValueHandling.Ignore
        }));
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    public static String CleanNewLine(String req)
    {
      return req.Replace("\r", " ").Replace("\n", " ");
    }
  }
}
