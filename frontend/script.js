// Produção (site HTTPS): "wss://SEU_BACKEND/?from=site"
// Dev local:             "ws://localhost:8080/?from=site"
const ENDERECO_WS = "wss://ericka-unraisable-harrison.ngrok-free.dev/?from=site"

const statusConexao = document.getElementById("status")
const valorTemperatura = document.getElementById("temp")
const valorUmidade = document.getElementById("umid")
const logMensagens = document.getElementById("raw")

const botaoLigarLed = document.getElementById("btnOn")
const botaoDesligarLed = document.getElementById("btnOff")
const campoJson = document.getElementById("jsonInput")
const botaoEnviarJson = document.getElementById("btnEnviarJson")
const erroJson = document.getElementById("erroJson")

let conexaoWs

function atualizarUiConectado() {
    statusConexao.textContent = "Conectado"
    statusConexao.className = "ok"
}
function atualizarUiDesconectado(texto = "Desconectado") {
    statusConexao.textContent = texto
    statusConexao.className = "bad"
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
        logMensagens.textContent = evento.data
        console.log(evento.data)
        try {
            const dados = JSON.parse(evento.data)
            if (typeof dados.temperatura === "number") valorTemperatura.textContent = dados.temperatura.toFixed(1) + " °C"
            if (typeof dados.umidade === "number") valorUmidade.textContent = dados.umidade.toFixed(1) + " %"
        } catch { /* se a mensagem recebida não for JSON, mostramos apenas o texto */}
    }

    // envia JSONs prontos
    botaoLigarLed.onclick = () => enviarObjetoJson({ led: 1 })
    botaoDesligarLed.onclick = () => enviarObjetoJson({ led: 0 })

    // envia JSON digitado
    botaoEnviarJson.onclick = () => {
        erroJson.textContent = ""
        const texto = campoJson.value.trim()
        if (!texto) return
        try {
            const objeto = JSON.parse(texto) // valida JSON do usuário
            enviarObjetoJson(objeto)
        } catch (e) {
            erroJson.textContent = "JSON inválido"
        }
    }
}

function enviarObjetoJson(objeto) {
    if (!conexaoWs || conexaoWs.readyState !== WebSocket.OPEN) return
    const mensagem = JSON.stringify(objeto)
    conexaoWs.send(mensagem)
}

conectar()
