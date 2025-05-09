import React from 'react';
import { Activity } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import LOGO from "../../../public/logo_blanco.png"

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado izquierdo - Banner */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-md mx-auto px-8 py-12 flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-1">
            <img src={LOGO} />
            {/* <Activity className="h-10 w-10" /> */}
            {/* <h1 className="text-2xl font-bold">Centro terapéutico</h1> */}
          </div>
          
          <h2 className="text-2xl font-bold mb-6">
            Sistema de gestión integral para clínicas de rehabilitación
          </h2>
          
          <p className="text-primary-100 mb-8 text-sm ">
            Administre pacientes, seguimientos médicos, pagos y comuníquese efectivamente 
            con los familiares a través de nuestra plataforma segura y fácil de usar.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-primary-400 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Seguimiento detallado</h3>
                <p className="text-sm text-primary-100">Registre avances diarios de los pacientes con fotos, videos y notas.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-primary-400 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Gestión financiera</h3>
                <p className="text-sm text-primary-100">Control completo de pagos, comprobantes y gastos del centro.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-primary-400 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Portal para familiares</h3>
                <p className="text-sm text-primary-100">Acceso seguro para que los familiares vean el progreso de su ser querido.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lado derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center mb-8">
            <Activity className="h-8 w-8 text-primary-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Centro terapéutico</h1>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;