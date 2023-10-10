using GeoAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace GeoAPI.Controllers
{
    public class CsvController : ApiController
    {
        // GET api/Csv/GetCSV
        public HttpResponseMessage GetCSV()
        {
            MemoryStream stream = new MemoryStream();
            StreamWriter writer = new StreamWriter(stream);
            writer.Write("Hello, World!");
            writer.Flush();
            stream.Position = 0;

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = "data.csv" };
            return result;
        }

        public List<RegionModel> GetNearbyLocations(string city, string state, string zipCode)
        {
            city = string.IsNullOrEmpty(city) ? "" : city.Trim().ToUpper();
            state = string.IsNullOrEmpty(state) ? "" : state.Trim().ToUpper();
            zipCode = string.IsNullOrEmpty(zipCode) ? "" : zipCode.Trim().ToUpper();

            if (GeoAPI.Models.Data.RawData == null)
            {
                GeoAPI.Models.Data.RawData = new List<RegionModel>();
                using (var fs = File.OpenRead(HttpContext.Current.Server.MapPath("~/Address.csv")))
                using (var reader = new StreamReader(fs))
                {
                    while (!reader.EndOfStream)
                    {
                        var line = reader.ReadLine();
                        var values = line.Split(',');

                        RegionModel newLine = new RegionModel();
                        newLine.LocationName = string.IsNullOrEmpty(values[0]) ? "" : values[0].Trim().ToUpper();
                        newLine.City = string.IsNullOrEmpty(values[3]) ? "" : values[3].Trim().ToUpper();
                        newLine.State = string.IsNullOrEmpty(values[4]) ? "" : values[4].Trim().ToUpper();
                        newLine.ZipCode = string.IsNullOrEmpty(values[5]) ? "" : values[5].Trim().ToUpper();
                        newLine.Latitude = string.IsNullOrEmpty(values[6]) ? "" : values[6].Trim().ToUpper();
                        newLine.Longitude = string.IsNullOrEmpty(values[7]) ? "" : values[7].Trim().ToUpper();
                        newLine.Country = "USA";

                        GeoAPI.Models.Data.RawData.Add(newLine);
                    }
                }
            }

            //Added data which fits the criteria
            List<RegionModel> returnAddresses = new List<RegionModel>();
            foreach (var item in GeoAPI.Models.Data.RawData)
            {
                bool isValidRecord = false;
                
                if (city != "" && item.City == city && state != "" && item.State == state)
                {
                    isValidRecord = true;
                }
                else if (zipCode != "")
                {
                    double ZipCodeDouble = double.Parse(zipCode);

                    if (item.City == city 
                        && (item.ZipCode.Contains(zipCode) 
                        || item.ZipCode.Contains((ZipCodeDouble + 1).ToString())
                        || item.ZipCode.Contains((ZipCodeDouble + 2).ToString())
                        || item.ZipCode.Contains((ZipCodeDouble - 1).ToString())
                        || item.ZipCode.Contains((ZipCodeDouble - 2).ToString())))
                        
                    isValidRecord = true;
                }

                if (isValidRecord) returnAddresses.Add(item);
            }

            var sortedList = returnAddresses.OrderBy(a => a.ZipCode).ToList();
            return sortedList;
        }
    }
    [Authorize]
    public class ValuesController : ApiController
    {
        // GET api/values
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }


        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
