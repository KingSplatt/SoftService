import Header from '../components/Header'

export default function MainCalendar() {
  return (
    <>
      <Header />

      <main className="container-xl mt-5">
        <h1 className="text-center fs-1">Bienvenido a SoftPortal</h1>
        <p className="text-center fs-4 mt-4">Tu portal de software confiable y actualizado</p>
      </main>

      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
        </div>
      </footer>
    </>
  )
}