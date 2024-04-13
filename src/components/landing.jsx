// LandingPage.jsx
import Link from 'next/link';
import React from 'react';
import './landing.css'; // Archivo CSS para estilos
import Image from 'next/image';
import logo from "../../public/landing_images/logo bitcom.png";
import cotizar from "../../public/landing_images/COTIZAR SERVICIO (3).png";
import compu1 from "../../public/landing_images/compu (1).png";
import tarjeta1 from "../../public/landing_images/tarjeta 1.png";
import tarjeta2 from "../../public/landing_images/tarjeta 2.png";
import tarjeta3 from "../../public/landing_images/tarjeta 3.png";
import tarjeta4 from "../../public/landing_images/tarjeta 4.png";
import tarjeta5 from "../../public/landing_images/tarjeta 5.png";
import tarjeta6 from "../../public/landing_images/tarjeta 6.png";
import sinTitulo3 from "../../public/landing_images/Sin título-3.png";
import alimentar from "../../public/landing_images/ALIMENTAR.png";
import americanExpress from "../../public/landing_images/AMERICAN EXPRESS.png";
import cabal from "../../public/landing_images/CABAL.png";
import maestro from "../../public/landing_images/MAESTRO.png";
import mastercard from "../../public/landing_images/MASTERCARD.png";
import naranjax from "../../public/landing_images/NARANJA X.png";
import naranja from "../../public/landing_images/NARANJA.png";
import ctadni from "../../public/landing_images/CUENTA DNI.png";
import dinersclub from "../../public/landing_images/DINERSCLUB.png";
import modo from "../../public/landing_images/MODO.png";
import pagocuentas from "../../public/landing_images/PAGO MIS CUENTAS.png";
import rapipago from "../../public/landing_images/RAPIPAGO.png";
import uala from "../../public/landing_images/UALA.png";
import pagar from "../../public/landing_images/PAGAR.png";
import mp from "../../public/landing_images/MERCADO PAGO.png";
import pay from "../../public/landing_images/PAY.png";
import payway from "../../public/landing_images/PAYWAY.png";
import wp from "../../public/landing_images/wp (1).png";
import botonlenguaje from "../../public/landing_images/botonLenguaje.png";

const LandingPage = () => {
  return (
    <div>
        <header id="header" className="header">
            <div className='rightHeader flex flex-row justify-between w-10/12'>
                <div className="name">
                    <Image quality={100} src={logo} alt="logo"/>
                </div>   
                <ul className="nav-links">
                    <li><a href="">Nuestra Plataforma</a></li>
                    <li><a href="">Servicios</a></li>
                    <li><a href="">Contacto</a></li>
                    <li/>
                </ul>
                <ul className='nav-botones'>
                    <li>
                        <button><Image className='lenguajeBoton' quality={100} width={150} src={botonlenguaje} alt=""/></button>
                    </li>
                    <li>
                        <Link className='comenzarBoton' href="/dashboard">Comienza hoy</Link>
                        </li>
                </ul>
                <div/>
            </div>
        </header>
        <main>
        <section className="home" id="home">
            <div className="header-home">
            <h1>Simplifique la gestión de <br/> tesorería <span>de su Empresa</span></h1>
                <p>Accede a un <span>servicio integral</span> de Gestion de Canales de Recaudación y<br/>
                Cash Managment de forma online con nuestra Plataforma.</p>

                <a href="#">
                    <button>
                        <Image quality={100} src={cotizar} alt=""/>
                    </button>
                </a>
            </div>
            
        </section>

        <section className="home-2" id="home-2">
            <div className="home-2-tittle">
                <h2>Nuestra <span>plataforma</span></h2>
                <p>Gestione sus cobranzas y pagos de forma online.</p>
            </div>
            <div className="home-2-container">
                <div className="grid-container">
                    <figure><Image quality={100} src={tarjeta1} alt=""/></figure>
                    <figure><Image quality={100} src={tarjeta2} alt=""/></figure>
                    <figure><Image quality={100} src={tarjeta3} alt=""/></figure>
                    <figure><Image quality={100} src={tarjeta4} alt=""/></figure>
                    <figure><Image quality={100} src={tarjeta5} alt=""/></figure>
                    <figure><Image quality={100} src={tarjeta6} alt=""/></figure>
                </div>
              </div>
        </section>
        <section className="home-3">
            <div className="home-3-tittle">
                <h2>Cash <span>Management</span></h2>
                <Image quality={100} src={compu1} alt="" className="Image-1"/>
            </div>
            <div className="home-3-items">
                <div className="items-1">
                    <p>Evite costos tercerizando los pagos a sus <br/>proveedores, servicios e impuestos.</p> <br/>
                    <p>Atesoramos los fondos recaudados en nuesta <br/>Cuenta Corriente Recaudadora Mayorista, a la <br/>espera de instrucciones de pagos por su Empresa.</p>
                </div>
                <div className="items-2">
                    <p>Sin limite en cuanto a volumen y cantidad de pagos.</p>
                    <ul>
                        <li>Pago a provedores</li>
                        <li>Pago de Honorarios y/o comisiones.</li>
                        <li>Pago de Servicios y/o Impuestos AFIP mediante VEP</li>
                    </ul>
                    <br/><p>Metodos de pago</p>
                    <ul>
                        <li>Transferencias Programadas</li>
                        <li>Transferencias Inmediatas.</li>
                        <li>Emisiones de CPD electronico</li>
                    </ul>
                </div>
            </div>    
        </section>
        <section className="prehome-4" >
            <div className='h-1'/>
            <div className="prehome-4-tittle">
                <h2>Nuestros servicios <span>destacados:</span></h2>
                <p>Gestione sus recaudaciones y pagos de forma online:</p>
                <br/>
            </div>
        </section>
        <div className='home-4-container'>
            <section className="home-4" >
                {/* <div className="home-4-tittle">
                    <h2>Nuestros servicios <span>destacados:</span></h2>
                    <p>Gestione sus recaudaciones y pagos de forma online:</p>
                    <br/>
                </div> */}
                {/* <Image quality={100} src={pagina2} alt=""/> */}
            </section>
        </div>
        <section className="home-5">
            <div className="home-5-tittle">
                <h2>Redes <span>habilitadas: </span></h2>
                <p>Nuestros principales partners</p>
            </div>

            <div className="slider">
                <div className="slide-track">
                    <div className="slide">
                        <Image quality={100} src={sinTitulo3} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={alimentar} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={americanExpress} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={cabal} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={maestro} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={mastercard} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={naranjax} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={naranja} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={ctadni} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={dinersclub} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={modo} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={pagocuentas} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={rapipago} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={uala} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={pagar} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={mp} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={pay} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={payway} alt=""/>
                    </div>
                    <div className="slide">
                        <Image quality={100} src={alimentar} alt=""/>
                    </div>
                </div>
            </div>
            <div className="containerFoot">
                <ul >
                    <li className='roboto-light'>© 2024 Bitcompay. Todos los derechos reservados</li>
                    <li><a href="https://api.whatsapp.com/send?phone=+54 9 11 5506-8673"><Image quality={100} src={wp} alt=""/></a></li>
                    <li><Image quality={100} className="logo-derechos" src={logo} alt=""/></li>
                    <li>Politicas de privacidad</li>
                    <li>Defensa del consumidor</li>
                </ul>
            </div>
            </section>
            </main>
            </div>
  );
}

export default LandingPage;