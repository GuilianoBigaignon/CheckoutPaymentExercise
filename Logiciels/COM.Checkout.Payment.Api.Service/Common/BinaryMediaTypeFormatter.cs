using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

#pragma warning disable 1570, 1574, 1584, 1591 
namespace COM.Checkout.Payment.Api.Service.Common
{
    public class BinaryMediaTypeFormatter : MediaTypeFormatter
    {
        private static readonly Type supportedType = typeof(byte[]);

        public BinaryMediaTypeFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/octet-stream"));
        }

        public override bool CanReadType(Type type)
        {
            return type == supportedType;
        }

        public override bool CanWriteType(Type type)
        {
            return type == supportedType;
        }

        public override async Task<object> ReadFromStreamAsync(Type type, Stream stream,
            HttpContent content, IFormatterLogger formatterLogger)
        {
            using (var memoryStream = new MemoryStream())
            {
                await stream.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }

        public override Task WriteToStreamAsync(Type type, object value, Stream stream,
            HttpContent content, TransportContext transportContext)
        {
            if (value == null)
                throw new ArgumentNullException("value");
            if (!type.IsSerializable)
                throw new SerializationException(
                    $"Type {type} is not marked as serializable");

            var binaryFormatter = new BinaryFormatter();
            binaryFormatter.Serialize(stream, value);
            return Task.FromResult(true);
        }
    }
}
#pragma warning restore 1570, 1574, 1584, 1591
