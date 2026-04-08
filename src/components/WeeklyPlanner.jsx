import React, { useState, useMemo, useEffect } from 'react';
import '../styles/weeklyPlanner.css';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { GoChevronLeft, GoChevronRight } from 'react-icons/go';

const WeeklyPlanner = ({ planejamentos, color, dateCreated }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  const weekDays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  useEffect(() => {
    const diasDesdeCriacao = diasDesde(dateCreated);
    console.log('Dias desde criação:', diasDesdeCriacao);
    setCurrentWeek(Math.floor((diasDesdeCriacao - 1) / 7));
    
  }, []);

  // Retorna o índice do dia da semana (0-6) para um dado dia sequencial
  const getDiaSemana = (diaSequencial) => {
    const inicio = new Date(dateCreated);
    const diaSemanaInicio = inicio.getUTCDay();
    return (diaSemanaInicio + diaSequencial - 1) % 7;
  };

  function diasDesde(dataString) {
    const dataPassada = new Date(dataString);
    const hoje = new Date();
  
    // Zerar em horário LOCAL, não UTC
    dataPassada.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
  
    const diferencaMs = hoje - dataPassada;
    return Math.floor(diferencaMs / (1000 * 60 * 60 * 24)) + 1;
  }

  const planejamentosPorDia = useMemo(() => {
    const porDia = {};
    planejamentos.forEach(item => {
      if (!porDia[item.day]) porDia[item.day] = [];
      porDia[item.day].push(item);
    });
    return porDia;
  }, [planejamentos]);

  const diasComPlanejamento = useMemo(() => {
    return Object.keys(planejamentosPorDia)
      .map(Number)
      .sort((a, b) => a - b);
  }, [planejamentosPorDia]);

  const diasDaSemanaAtual = useMemo(() => {
    if (diasComPlanejamento.length === 0) return [];
    const startIndex = currentWeek * 7;
    return diasComPlanejamento.slice(startIndex, startIndex + 7);
  }, [diasComPlanejamento, currentWeek]);

  const temProximaSemana = useMemo(() => {
    return (currentWeek + 1) * 7 < diasComPlanejamento.length;
  }, [diasComPlanejamento, currentWeek]);

  const temSemanaAnterior = currentWeek > 0;

  const proximaSemana = () => { if (temProximaSemana) setCurrentWeek(prev => prev + 1); };
  const semanaAnterior = () => { if (temSemanaAnterior) setCurrentWeek(prev => prev - 1); };

  if (diasComPlanejamento.length === 0) {
    return (
      <div className="weekly-planner-empty">
        <h2>Nenhum planejamento encontrado</h2>
      </div>
    );
  }

  return (
    <div className="weekly-planner">
      <div className="header-cronograma-container">
        <div className="start-container">
          <div className="icon">
            <IoCalendarClearOutline />
          </div>
          <div>
            <h2 style={{ marginBottom: '5px' }}>Cronograma semanal</h2>
            <span>Planejamento de {Math.ceil(diasComPlanejamento.length / 7)} semanas</span>
          </div>
        </div>
        <div className="end-container">
          <button onClick={semanaAnterior} disabled={!temSemanaAnterior}>
            <GoChevronLeft />
          </button>
          <span>Semana {currentWeek + 1} de {Math.ceil(diasComPlanejamento.length / 7)}</span>
          <button onClick={proximaSemana} disabled={!temProximaSemana}>
            <GoChevronRight />
          </button>
        </div>
      </div>

      <div className="week-grid">
        {diasDaSemanaAtual.map((dia) => {
          const planejamentosDoDia = planejamentosPorDia[dia] || [];
          const indiceDiaSemana = getDiaSemana(dia);
          const nomeDiaSemana = weekDays[indiceDiaSemana];
          const isHoje = diasDesde(dateCreated) === dia;

          return (
            <div
              key={dia}
              className="day-card"
              style={isHoje ? { border: '2px solid ' + color } : {}}
            >
              <div
                className="day-header"
                style={isHoje ? { backgroundColor: color } : {}}
              >
                <h2>{nomeDiaSemana}</h2>
                <span className="day-number">
                  Dia {dia} {isHoje ? '(Hoje)' : ''}
                </span>
              </div>

              <div className="day-content">
                {planejamentosDoDia.map(item => (
                  <div key={item.id} className="subject-item">
                    <h3>{item.diciplina}</h3>
                    <ul className="topics-list">
                      {item.topics.map((topic, idx) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {planejamentosDoDia.length === 0 && (
                  <p className="no-content">📅 Nenhum conteúdo planejado</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyPlanner;