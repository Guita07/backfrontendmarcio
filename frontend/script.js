// Produção (site HTTPS): "wss://SEU_BACKEND/?from=site"
// Dev local:             "ws://localhost:8080/?from=site"
const ENDERECO_WS = "wss://unthronged-crinkly-meagan.ngrok-free.dev/?from=site"

const statusConexao = document.getElementById("status")
const logMensagens = document.getElementById("raw")

let conexaoWs

// Variáveis globais que serão acessadas pelo index.html
window.dadosEsp32 = {
    oculosConectado: true,
    alertasAcidente: 0,
    alertasSono: 0
}

function atualizarUiConectado() {
    if (statusConexao) {
        statusConexao.textContent = "Conectado"
        statusConexao.className = "ok"
    }
}

function atualizarUiDesconectado(texto = "Desconectado") {
    if (statusConexao) {
        statusConexao.textContent = texto
        statusConexao.className = "bad"
    }
}

function conectar() {
    conexaoWs = new WebSocket(ENDERECO_WS)

    conexaoWs.onopen = () => atualizarUiConectado()
    conexaoWs.onerror = () => atualizarUiDesconectado("Erro")
    conexaoWs.onclose = () => { 
        atualizarUiDesconectado()
        setTimeout(conectar, 1200) 
    }

    conexaoWs.onmessage = (evento) => {
        if (logMensagens) {
            logMensagens.textContent = evento.data
        }
        console.log(evento.data)
        
        try {
            const dados = JSON.parse(evento.data)
            
            // Atualiza as variáveis importantes do ESP32
            if (typeof dados.oculosConectado === "boolean") {
                window.dadosEsp32.oculosConectado = dados.oculosConectado
                console.log("Óculos conectado:", dados.oculosConectado)
            }
            
            if (typeof dados.alertasAcidente === "number") {
                window.dadosEsp32.alertasAcidente = dados.alertasAcidente
                console.log("Alertas de acidente:", dados.alertasAcidente)
            }
            
            if (typeof dados.alertasSono === "number") {
                window.dadosEsp32.alertasSono = dados.alertasSono
                console.log("Alertas de sono:", dados.alertasSono)
            }
            
        } catch { 
            // se a mensagem recebida não for JSON, apenas registra
            console.log("Mensagem não-JSON recebida:", evento.data)
        }
    }
}

function enviarObjetoJson(objeto) {
    if (!conexaoWs || conexaoWs.readyState !== WebSocket.OPEN) return
    const mensagem = JSON.stringify(objeto)
    conexaoWs.send(mensagem)
}

conectar()