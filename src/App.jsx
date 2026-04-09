import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Cronogramas from './pages/Cronogramas'
import PrivateRoute from './components/PrivateRoute'
import SelectConcurso from './pages/SelectConcurso'
import Cronograma from './pages/Cronograma'
import Plans from './pages/Plans'
import Profile from './pages/admin/Profile'
import PagamentoSucesso from './pages/SucessPaymento'
import PagamentoCancelado from './pages/CancelPayment'
import NotFound from './pages/NotFound'
import Questoes from './pages/Questoes'
import Dashboard from './pages/Dashboard'
import ScrollToTop from './components/ScrollToTop'

function App() {

  

  return (
    <BrowserRouter>
    <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/selecionar-concurso" element={<SelectConcurso />} />
        <Route  path='/cronograma/:id' element={<Cronograma/>}/>
        <Route path='/usuario/planos' element={<Plans/>}/>
        <Route path='/usuario' element={<Profile/>}/>
        <Route path='questoes' element={<Questoes/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/payment/sucess' element={<PagamentoSucesso/>}/>
        <Route path='/payment/cancel' element={<PagamentoCancelado/>}/>
        <Route path="*" element={<NotFound />} />
        <Route
          path="/cronogramas"
          element={
            <PrivateRoute>
              <Cronogramas />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
