using Autofac;
using Framework.Database;
using Framework.Database.SQL;
using Framework.Database.Testing;
using ICTER.Online.Api.Service;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Reflection;


namespace ICTER.Online.Tests
{
    public abstract class AbstractBaseICTERTest
    {
        #region Déclaration des variables 

        protected static readonly ConnectionStringSettings _connSettings = ConfigurationManager.ConnectionStrings["DBServices"];


        /// <summary>
        /// Conteneur AutoFAC (unique durant tout le cycle de vue d'un TU imbriqué ou pas)
        /// </summary>
        protected static IContainer _container;

        /// <summary>
        /// Contexte BDD pour l'ensemble des tests (unique durant tout le cycle de vue d'un TU imbriqué ou pas)
        /// </summary>
        protected static IDbContext _conn;


        protected static IDbContext _connICTER;

        #endregion

        #region Gestion AutoFac

        /// <summary>
        /// Contexte BDD pour les tests
        /// </summary>
        /// <returns></returns>
        private IDbContextFactoryTesting GetDbContextFactoryForTest()
        {   
            return (IDbContextFactoryTesting)_container.Resolve<IDbContextFactory>();
        }

        /// <summary>
        /// Constructeur de base pour tous les tests
        /// </summary>
        public AbstractBaseICTERTest()
        {
            if (_container == null) //Un container unique pour toute la durée de vie d'un test
            {
                var builder = new ContainerBuilder(); // Un builder pour l'ensemble des enregistrements AutoFac                

                //_container = new ContainerBuilder().Build(); // Creation d'un conteneur par défaut

                //_container.UpdateForUnitTest(_connSettings);

                //var testContext = GetDbContextFactoryForTest().CreateContext();

                // _conn = testContext; //Contexte unique pour toute la durée de vie d'un test

                ConnectionStringSettings connSettings = ConfigurationManager.ConnectionStrings["DBServices"];
                ConnectionStringSettings connSettingsICTER = ConfigurationManager.ConnectionStrings["DBServicesICTER"];

                var factory = DbContextFactoryBuilderTesting.Build(connSettings);
                var factoryICTER = DbContextFactoryBuilderTesting.Build(connSettingsICTER);

                builder.RegisterInstance(factory).Named<IDbContextFactory>("MTCAB");
                builder.RegisterInstance(factoryICTER).Named<IDbContextFactory>("ICTER");

                _conn = factory.CreateContext();
                _connICTER = factoryICTER.CreateContext();

                //_connICTER = factoryICTER.CreateContext();
                //builder.RegisterInstance(testContext).As<IDbContext>();

                #region Enregistrements AutoFac

                //AutoFac pour 
                Online.Api.AutofacConfig.AutofacRegister(builder);

                _container = builder.Build(); // Creation d'un conteneur par défaut

                #endregion
                //builder.Update(_container);

                //RAZ des données communes BDD (ex. ADM_SYSPARAM et ADM_LIBELLE)
                InitDatabaseCommonData(_conn);
            }
        }

        /// <summary>
        /// Base Cleanup ==> Database init
        /// </summary>
        protected void ResetDatabase()
        {
            var resolverCache = _container.Resolve<ICacheServices>();
            resolverCache.ClearCache();
            AbandonDatabaseTransaction(_conn, _connICTER);
        }

        /// <summary>
        /// Rollback de toutes les données de la BDD
        /// </summary>
        /// <param name="conn"></param>
        private void AbandonDatabaseTransaction(IDbContext conn, IDbContext connICTER)
        {
            //RAZ de sequences BDD
            ResetSequences(conn);
            ResetSequences(connICTER);

            var contextFactory = (IDbContextFactoryTesting)_container.ResolveNamed<IDbContextFactory>("MTCAB");
            var contextFactoryICTER = (IDbContextFactoryTesting)_container.ResolveNamed<IDbContextFactory>("ICTER");
            contextFactory.CloseContextAfterTest();
            contextFactoryICTER.CloseContextAfterTest();

            _conn = null;
            _connICTER = null;
            _container = null;
        }

        #endregion

        #region Initialisation BDD

        /// <summary>
        /// RAZ des données système de la BDD avant chaque TU
        /// </summary>
        /// <param name="conn"></param>
        protected void InitDatabaseCommonData(IDbContext conn)
        {
            CreateCommonData(conn);
            CreateAdmLibelleDataForJeuParametre();

        }

        /// <summary>
        /// RAZ des sequences pendant un test si besoin
        /// </summary>
        /// <param name="conn"></param>
        private void ResetSequences(IDbContext conn)
        {
            //Préparation de la commande de RAZ de toutes les sequences dbo
            var commands = conn.Query<string>(new SqlQueryBuilder()
                   .Select(@" 'ALTER SEQUENCE '
                              + QUOTENAME(schema_name(schema_id))
                              + '.'
                              + QUOTENAME(name)
                              + ' RESTART WITH '
                              + TRY_CONVERT(nvarchar(50),[start_value])
                         AS[QUERY]"
                   )
                   .From("sys.sequences")
                   .ToSql()
           );

            //Execution des commandes de RAZ
            foreach (var command in commands)
            {
                conn.Execute(command);
            }
            conn.Save();
        }

        /// <summary>
        /// Remise à zéro de la BDD pour le prochain test
        /// </summary>
        /// <param name="conn"></param>
        protected void cleanupDatabaseForNextTest(IDbContext conn)
        {
            conn.Execute("EXEC sp_MSForEachTable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'");
            conn.Execute("EXEC sp_MSForEachTable 'DELETE FROM ?'");
            conn.Execute("EXEC sp_MSForEachTable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'");

            //RAZ de sequences BDD
            ResetSequences(conn);

            //RAZ des données communes BDD (ex. ADM_SYSPARAM et ADM_LIBELLE)
            InitDatabaseCommonData(conn);

            conn.Save();
        }

        /// <summary>
        /// Renseigne les données communes à tous les tests
        /// </summary>
        /// <param name="conn"></param>
        private void CreateCommonData(IDbContext conn)
        {
            this.InsertData("ADM_SYSPARAM", conn);
        }

        /// <summary>
        /// Supprime les données communes à tous les tests
        /// </summary>
        /// <param name="conn"></param>
        private void DeleteCommonData(IDbContext conn)
        {
            conn.Execute(new SqlDeleteBuilder("ADM_SYSPARAM")
                .Where("NOM_SECTION = :NOMSECTION AND NOM_PARAMETRE = :NOMPARAMETRE")
                .ToSql(),
                new { NOMSECTION = "LOGGER", NOMPARAMETRE = "DIR_LOG" });

            conn.Execute(new SqlDeleteBuilder("ADM_SYSPARAM")
                .Where("NOM_SECTION = :NOMSECTION AND NOM_PARAMETRE = :NOMPARAMETRE")
                .ToSql(),
                new { NOMSECTION = "LOGGER", NOMPARAMETRE = "FILE_LOG" });

            conn.Save();
        }


        /// <summary>
        /// Supprime le parametre AdmSysParam FTP_PARAM_ROOT pour la section ITF_EQUIPEMENT
        /// (Utilise uniquement pour faciliter le remappage du chemin des tests export)
        /// </summary>
        /// <param name="conn"></param>
        protected void DeleteAdmSysParamFtpRootForTest(IDbContext conn)
        {
            conn.Execute(new SqlDeleteBuilder("ADM_SYSPARAM")
                .Where("NOM_SECTION = :NOMSECTION AND NOM_PARAMETRE = :NOMPARAMETRE")
                .ToSql(),
                new { NOMSECTION = "ITF_EQUIPEMENT", NOMPARAMETRE = "FTP_PARAM_ROOT" });
            conn.Save();
        }

        /// <summary>
        ///  Créer tous les elements requis pour les jeux de paramètres dans ADM_LIBELLE
        /// </summary>        
        private void CreateAdmLibelleDataForJeuParametre()
        {
            this.InsertData("ADM_LIBELLE", _conn);

        }
        private void CreateAdmLibelleDataForJeuParametreICTER()
        {
            this.InsertData("ADM_LIBELLE", _connICTER);

        }

        /// <summary>
        ///  Supprime tous les elements requis pour les jeux de paramètres dans ADM_LIBELLE
        /// </summary>        
        private void DeleteAdmLibelleDataForJeuParametre(IDbContext conn)
        {
            conn.Execute("delete FROM [dbo].[ADM_LIBELLE] WHERE NOM_SECTION IN ('TYPE_JEU_PARAMETRE', 'TYPE_PARAMETRE','ETAT_JEU_PARAM','RESTRICTION_JEU_PARAMETRE')");
            conn.Save();
        }



        /// <summary>
        ///     Use for insert data from SQL files in DatabaseData\
        /// </summary>
        /// <param name="tableName"></param>
        public void InsertData(string tableName, IDbContext conn)
        {
            IEnumerable<string> sqlCommands = GetTableInsertCommands(tableName);
            foreach (string sqlCommand in sqlCommands)
                if (sqlCommand.StartsWith("INSERT")) { conn.Execute(sqlCommand); }
            conn.Save();
        }
        public void UpdateData(string tableName, IDbContext conn)
        {
            IEnumerable<string> sqlCommands = GetTableInsertCommands(tableName);
            foreach (string sqlCommand in sqlCommands)
                if (sqlCommand.StartsWith("UPDATE")) { conn.Execute(sqlCommand); }
            conn.Save();
        }

        /// <summary>
        ///     Get SQL fileName
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        private static IEnumerable<string> GetTableInsertCommands(string tableName)
        {
            string basePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

            if (basePath == null)
                throw new DirectoryNotFoundException();

            string path =
                Path.Combine(basePath, $"DatabaseData\\{tableName}.data.sql");
            return File.ReadLines(path);
        }

        #endregion

    }
}
