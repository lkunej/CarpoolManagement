using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarpoolManagement.DAL
{
    public interface IDbInitializer
    {
        /// <summary>
        /// Adds some default values to the Db
        /// </summary>
        void SeedData();
    }
}
