

export function Autenticacao({children}) {

    const estaLogado = localStorage.getItem("token")
    if(!estaLogado){

        return <Navigate to="/"/>
    }
    return children;
}