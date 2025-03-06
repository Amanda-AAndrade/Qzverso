document.addEventListener("DOMContentLoaded", function () {
    // Dropdown do menu principal
    let dropdowns = document.querySelectorAll("nav ul li ul");
    let menuItems = document.querySelectorAll("nav ul li a");
    
    menuItems.forEach(item => {
        item.addEventListener("mouseenter", function () {
            let submenu = this.nextElementSibling;
            if (submenu && submenu.tagName === "UL") {
                submenu.style.display = "block";
            }
        });
    });
    
    document.addEventListener("click", function (event) {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.style.display = "none";
            }
        });
    });
  
    // Dropdown do usuário
    let profileButton = document.querySelector("#profile-dropdown button");
    let profileMenu = document.querySelector(".dropdown-menu");
  
    if (profileButton) {
        profileButton.addEventListener("click", function (event) {
            event.stopPropagation();
            profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
        });
    }
    
    document.addEventListener("click", function () {
        if (profileMenu) {
            profileMenu.style.display = "none";
        }
    });
  
    // Exibir uma saudação com o username
    let username = localStorage.getItem("username") || "Visitante";
    let usernameDisplay = document.querySelector(".username");
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
  
    // Adicionando animação suave ao menu dropdown
    let dropdownMenus = document.querySelectorAll(".dropdown-menu");
    dropdownMenus.forEach(menu => {
        menu.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        menu.style.transform = "translateY(-10px)";
        menu.style.opacity = "0";
    });
  
    profileButton.addEventListener("click", function () {
        if (profileMenu.style.display === "none" || profileMenu.style.opacity === "0") {
            profileMenu.style.display = "block";
            setTimeout(() => {
                profileMenu.style.opacity = "1";
                profileMenu.style.transform = "translateY(0)";
            }, 10);
        } else {
            profileMenu.style.opacity = "0";
            profileMenu.style.transform = "translateY(-10px)";
            setTimeout(() => {
                profileMenu.style.display = "none";
            }, 300);
        }
    });
  
    // Exibição de subcategorias ao passar o mouse
    let categoriaDropdowns = document.querySelectorAll(".categoria-dropdown");
    
    categoriaDropdowns.forEach(categoria => {
        categoria.addEventListener("mouseenter", function () {
            let subMenu = this.querySelector("ul");
            if (subMenu) {
                subMenu.style.display = "block";
            }
        });
        
        categoria.addEventListener("mouseleave", function () {
            let subMenu = this.querySelector("ul");
            if (subMenu) {
                subMenu.style.display = "none";
            }
        });
    });
  });

  import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Perfil from './Perfil';
import Qzverso from './Qzverso';
import EmAlta from './EmAlta';
import Categorias from './Categorias';
import Publicar from './Publicar';
import Configuracoes from './Configuracoes';
import './App.css';

function App() {
    const [tema, setTema] = useState('claro');

    const mudarTema = (novoTema) => {
        setTema(novoTema);
    };

    return (
        <Router>
            <div className={`app ${tema}`}>
                <nav>
                    <ul>
                        <li><Link to="/perfil">Perfil</Link></li>
                        <li><Link to="/qzverso">Qzverso</Link></li>
                        <li><Link to="/em-alta">Em Alta</Link></li>
                        <li><Link to="/categorias">Fics por Categorias</Link></li>
                        <li><Link to="/publicar">Publique sua História</Link></li>
                        <li><Link to="/configuracoes">Configurações</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/qzverso" element={<Qzverso />} />
                    <Route path="/em-alta" element={<EmAlta />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/publicar" element={<Publicar />} />
                    <Route path="/configuracoes" element={<Configuracoes mudarTema={mudarTema} />} />
                </Routes>
            </div>
        </Router>
    );
}
function scrollDireita(id) {
    document.getElementById(id).scrollBy({ left: 300, behavior: "smooth" });
}

function scrollEsquerda(id) {
    document.getElementById(id).scrollBy({ left: -300, behavior: "smooth" });
}
