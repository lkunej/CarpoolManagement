using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarpoolManagment.DAL
{
    public interface IDbInitializer
    {
        /// <summary>
        /// Adds some default values to the Db
        /// </summary>
        void SeedData();
    }
}
