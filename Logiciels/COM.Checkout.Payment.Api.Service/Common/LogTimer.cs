
using System;
using System.Collections.Generic;
using log4net;
using System.Diagnostics;
using System.Reflection;

namespace COM.Checkout.Payment.Api.Service.Common
{
    public class LogTimer : IDisposable
  {
    private static readonly ILog _elk = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
    private Stopwatch _sw;
    private String _title;
    public List<KeyValuePair<String, long>> _counters;

    public long Intermed { get; private set; }
    public long Total { get { _sw.Stop(); Intermed = _sw.ElapsedMilliseconds; _sw.Start(); return Intermed; } }

    /// <summary>
    /// Constructor for new logtimer
    /// </summary>
    public LogTimer(String title)
    {
      _counters = new List<KeyValuePair<string, long>>();

      _title = title;
      _sw = new Stopwatch();
      _sw.Start();
      Intermed = _sw.ElapsedMilliseconds;
    }

    /// <summary>
    /// Log intermediate time
    /// </summary>
    /// <param name="text"></param>
    public void LogIntermediate(String text)
    {
      _sw.Stop();
      _counters.Add(new KeyValuePair<string, long>(text, _sw.ElapsedMilliseconds - Intermed));
      _elk.DebugFormat("{0}{1} ({2} ms)", _title, text, _sw.ElapsedMilliseconds - Intermed);
      Intermed = _sw.ElapsedMilliseconds;
      _sw.Start();
    }

    /// <summary>
    /// Log Total counter
    /// </summary>
    public void LogTotal()
    {
      _sw.Stop();
      _elk.DebugFormat("{0}Total ({1} ms)", _title, _sw.ElapsedMilliseconds);
      _counters.Add(new KeyValuePair<string, long>("Total", _sw.ElapsedMilliseconds));
    }

    public string Counters()
    {
      return Utils.CleanSerialize(_counters);
    }

    /// <summary>
    /// Dispose
    /// </summary>
    public void Dispose()
    {
      _sw.Stop();
    }
  }
}
