"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Map,
  Trash2,
  Users,
  CheckCircle,
  Truck,
  Leaf,
  Mail,
  Clock,
  MapPin,
  AlertTriangle
} from "lucide-react";
import MobileBottomNav from '@/components/ui/MobileBottomNav'

export default function CleanCityLanding() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#bbf7d0]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-[#86efac] to-[#7dd3fc] p-2 rounded-xl text-white">
                <Leaf size={24} />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">CleanCity</span>
            </div>
            <div className="hidden md:flex gap-8">
              <Link href="/schedules" className="text-slate-600 hover:text-[#86efac] transition-colors font-medium">Horarios</Link>
              <Link href="/routes" className="text-slate-600 hover:text-[#7dd3fc] transition-colors font-medium">Rutas</Link>
              <Link href="/alerts" className="text-slate-600 hover:text-[#7dd3fc] transition-colors font-medium">Alertas</Link>
              <Link href="/announcements" className="text-slate-600 hover:text-[#86efac] transition-colors font-medium">Comunicados</Link>
            </div>

            <div className="flex gap-4">
              <Link href="/login" className="hidden md:block px-5 py-2.5 rounded-full text-slate-700 font-medium hover:bg-[#dbeafe] transition-all text-center">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#86efac] to-[#7dd3fc] text-slate-900 font-medium hover:scale-105 transition-all shadow-sm text-center">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative z-0 overflow-hidden group">
        <div className="absolute inset-0 -z-20">
          <Image 
            src="/images/Plaza.jpg" 
            alt="Fondo de Plaza de Cusco"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-[2000ms]"
            priority
          />
        </div>
        
        <div className="w-full max-w-[1600px] xl:px-12 mx-auto grid lg:grid-cols-2 gap-10 lg:gap-24 items-center relative z-10">
          <div className="flex flex-col gap-6 lg:gap-8 bg-white/40 backdrop-blur-md p-6 sm:p-10 rounded-[3rem] border border-white/50 shadow-2xl shadow-black/5 items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dbeafe] text-[#2563eb] w-fit font-medium text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2563eb]"></span>
              </span>
              Plataforma Smart City Activa
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900">
              Gestiona la recolección de residuos de tu ciudad de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-[#38bdf8]">forma inteligente</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
              Consulta horarios, rutas, alertas y reporta incidencias fácilmente desde una sola plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center lg:justify-start">
              <Link href="/routes" className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#86efac] to-[#34d399] text-emerald-950 font-bold rounded-2xl shadow-lg shadow-[#86efac]/30 hover:scale-105 transition-all">
                <MapPin size={20} />
                Explorar Rutas
              </Link>
              <Link href="/reportes" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl shadow-lg shadow-slate-200 hover:bg-[#f8fafc] hover:scale-105 transition-all border border-slate-100">
                <AlertTriangle size={20} />
                Reportar incidencia
              </Link>
            </div>
          </div>
          
          <div className="relative h-[400px] lg:h-[600px] w-full bg-white/20 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-2xl shadow-[#7dd3fc]/20 p-6 overflow-hidden flex flex-col justify-center items-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="relative z-10 flex flex-col gap-6 w-full max-w-sm">
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-4 border border-slate-50 animate-bounce-slow">
                <div className="h-12 w-12 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#3b82f6]">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Camión en ruta</h4>
                  <p className="text-sm text-slate-500">Llegada aprox. 15 mins</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col gap-3 border border-slate-50 ml-12 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <CheckCircle size={18} />
                    <span className="font-bold text-sm">Zona Limpia</span>
                  </div>
                  <span className="text-xs bg-[#bbf7d0] text-emerald-800 px-2 py-1 rounded-full font-medium">Hoy</span>
                </div>
                <p className="text-sm text-slate-600">Recolección completada en Sector Centro.</p>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tr from-[#7dd3fc] to-[#38bdf8] rounded-full blur-2xl opacity-40"></div>
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-[#86efac] to-[#34d399] rounded-full blur-2xl opacity-40"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/60 backdrop-blur-md border-y border-slate-100">
        <div className="w-full max-w-[1600px] xl:px-12 mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Ton. Recolectadas", value: "12.5k", icon: Trash2, color: "text-emerald-500" },
            { label: "Zonas Cubiertas", value: "100%", icon: Map, color: "text-blue-500" },
            { label: "Incidencias Resueltas", value: "2.4k", icon: CheckCircle, color: "text-teal-500" },
            { label: "Ciudadanos Activos", value: "45k+", icon: Users, color: "text-sky-500" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <stat.icon size={32} className={`${stat.color} mb-2`} />
              <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 px-4 rounded-t-[3rem]">
        <div className="w-full max-w-[1600px] xl:px-12 mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-8">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-gradient-to-tr from-[#86efac] to-[#7dd3fc] p-2 rounded-xl text-slate-900">
                <Leaf size={24} />
              </div>
              <span className="font-bold text-2xl tracking-tight">CleanCity</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Plataforma de gestión inteligente de residuos urbanos para una ciudad más limpia y sostenible.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Enlaces</h4>
            <ul className="flex flex-col gap-4 text-slate-400 text-sm font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">Horarios de Recojo</li>
              <li className="hover:text-white cursor-pointer transition-colors">Puntos Limpios</li>
              <li className="hover:text-white cursor-pointer transition-colors">Sobre el Proyecto</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contacto</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Servicios</h4>
            <ul className="flex flex-col gap-4 text-slate-400 text-sm font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">Reporte Ciudadano</li>
              <li className="hover:text-white cursor-pointer transition-colors">Rutas de Camiones</li>
              <li className="hover:text-white cursor-pointer transition-colors">Calendario Mensual</li>
              <li className="hover:text-white cursor-pointer transition-colors">Guía de Reciclaje</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="flex flex-col gap-4 text-slate-400 text-sm font-medium">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#3b82f6]" /> info@cleancity.gob
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-[#3b82f6]" /> Lun - Vie 8:00 - 17:00
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[#3b82f6]" /> Palacio Municipal, Plaza de Armas
              </li>
            </ul>
          </div>
        </div>
        <div className="w-full max-w-[1600px] xl:px-12 mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium text-center md:text-left">
          <p>© 2026 CleanCity Platform. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Política de Privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Términos de Servicio</span>
            <span className="hover:text-white cursor-pointer transition-colors">Accesibilidad</span>
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
