using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GeoAPI.Models
{
    public class Data
    {
        public static List<RegionModel> RawData { get; set; }
    }
    
    public class RegionModel
    {
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string Area { get; set; }
        public string ZipCode { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string LocationName { get; set; }
        public string Region { get; set; }
    }
}