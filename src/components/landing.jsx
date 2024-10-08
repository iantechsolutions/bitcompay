// LandingPage.jsx
import React from 'react';
import './landing.css'; // Archivo CSS para estilos

const LandingPage = () => {
  return (
    <div>
        <header id="header" className="header">
            <div className='rightHeader flex flex-row justify-between w-10/12'>
                <div className="name">
                    <img src="https://utfs.io/f/5e8f0ac9-219d-4b75-bf71-1768551d369c-ju8o7r.png" alt="logo"/>
                </div>   
                <ul className="nav-links">
                    <li><a href="">Nuestra Plataforma</a></li>
                    <li><a href="">Servicios</a></li>
                    <li><a href="">Contacto</a></li>
                    <li/>
                </ul>
            </div>
        </header>
        <main>
        <section className="home" id="home">
            <div className="header-home">
            <h1>Simplificá la gestión de <br/> tesorería <span>de tu empresa</span></h1>
                <p>Accedé a un <span>servicio integral</span> de Gestión de Canales de Recaudación y<br/>
                Cash Managment de manera online con nuestra plataforma.</p>

                <a href="#">
                    <button>
                        <img src="https://utfs.io/f/a792bec9-01b7-40c7-84a8-81945b3800f1-xw5b7a.png" alt=""/>
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
                    <figure><img src="https://utfs.io/f/2f53996b-28a5-4ee5-8167-5e3fa25e2455-c2frxe.png" alt=""/></figure>
                    <figure><img src="https://utfs.io/f/847c1eab-1be0-4a88-9e0b-61475fa0cb88-c2frxd.png" alt=""/></figure>
                    <figure><img src="https://utfs.io/f/9c8d4b16-ed42-4958-8a08-4b672c554a9e-c2frxc.png" alt=""/></figure>
                    <figure><img src="https://utfs.io/f/19acdbb4-e7fb-46ab-9112-50acd7ca5ef1-c2frxb.png" alt=""/></figure>
                    <figure><img src="https://utfs.io/f/3f0727e4-7e48-4fc9-a6a8-6d391adaf19f-c2frxa.png" alt=""/></figure>
                    <figure><img src="https://utfs.io/f/9a736e15-ada0-4dca-9b7c-fa258a5c3161-c2frx9.png" alt=""/></figure>
                </div>
              </div>
        </section>
        <section className="home-3">
            <div className="home-3-tittle">
                <h2>Cash <span>Management</span></h2>
                <img src="https://utfs.io/f/b4cd7f90-c765-4268-abf9-ca8013ebee0c-n3l7dm.png" alt="" className="Image-1"/>
            </div>
            <div className="home-3-items">
                <div className="items-1">
                    <p>Evite costos tercerizando los pagos a sus <br/>proveedores, servicios e impuestos.</p> <br/>
                    <p>Atesoramos los fondos recaudados en nuesta <br/>Cuenta Corriente Recaudadora Mayorista<br/>, a la  espera de instrucciones de pagos por su Empresa.</p>
                </div>
                <div className="items-2">
                    <p>Sin límite en cuanto a volumen y cantidad de pagos.</p>
                    <ul>
                        <li>Pago a provedores</li>
                        <li>Pago de Honorarios y/o comisiones.</li>
                        <li>Pago de Servicios y/o Impuestos AFIP mediante VEP</li>
                    </ul>
                    <br/><p>Métodos de pago</p>
                    <ul>
                        <li>Transferencias Programadas</li>
                        <li>Transferencias Inmediatas.</li>
                        <li>Emisiones de CPD electrónico</li>
                    </ul>
                </div>
            </div>    
        </section>
        <section className="prehome-4" >
            <div className='h-1'/>
            <div className="prehome-4-tittle">
                <h2>Nuestros servicios <span>destacados:</span></h2>
                <p>Gestione sus recaudaciones y pagos de manera online:</p>
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
                {/* <img src={pagina2} alt=""/> */}
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
                        <img src="https://utfs.io/f/d65bb799-fc6b-49d0-9b13-c72fd178d247-6l0zjp.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/59d45ccc-af0e-451c-9cf9-cbec35168a10-6zuk99.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/50fe0216-de4b-4655-9f46-d85985fcfc71-f2a4s0.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/f88600ef-f37a-45a2-9eb5-486cb66987ad-1214gf.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/1b51543d-b1c7-4527-a939-631a0c0a7f74-pk50cv.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/a249bd8a-6dbf-4048-80c6-88068d64b2a0-pozkpa.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/40c46905-5f75-42a0-a930-911e4d77f410-3uo82t.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/cf0f1e5d-aff8-4539-aec2-8bdc0d105785-ulr23h.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/eab23092-4e23-48e2-96ce-1b52fcad998b-abybq1.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/e0a3b5f3-d7d4-407b-9103-1e310016111d-pfx4st.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/d9b8025b-1cb3-410c-a31d-3bbf65bfeb28-1eu99.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/c908c8cd-9d80-4c72-ac07-37abbee2bc4c-va9nh7.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/2478b388-1cf1-4ffd-b69f-b87afc7eceae-i3vyf5.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/014f70f9-b4e0-4372-8238-4f4dc840ca86-1jny9.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/8e0893fa-c63c-44b8-9474-e58abccc99a0-196jvr.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/8132bdbf-9ceb-4b9c-94f9-6974d95aba57-wm781i.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/27f8dc4f-9ee7-4aa7-9c44-d69bd99e62ac-1oy0.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/53ad432b-9bdf-4a3d-a6a2-aecebe724227-w44zw9.png" alt=""/>
                    </div>
                    <div className="slide">
                        <img src="https://utfs.io/f/59d45ccc-af0e-451c-9cf9-cbec35168a10-6zuk99.png" alt=""/>
                    </div>
                </div>
            </div>
            <div className="containerFoot">
                <ul >
                    <li className='roboto-light'>© 2024 Bitcompay. Todos los derechos reservados</li>
                    <li><a href="https://api.whatsapp.com/send?phone=+54 9 11 5506-8673"><img src="https://utfs.io/f/8fb9d30c-2089-4ff7-b033-62ff0cc1d72f-cyks5j.png" alt=""/></a></li>
                    <li><img className="logo-derechos" src="https://utfs.io/f/5e8f0ac9-219d-4b75-bf71-1768551d369c-ju8o7r.png" alt=""/></li>
                    <li>Políticas de privacidad</li>
                    <li>Defensa del consumidor</li>
                </ul>
            </div>
            </section>
            </main>
            </div>
  );
}

export default LandingPage;