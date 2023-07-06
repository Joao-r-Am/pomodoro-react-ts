import React, { useEffect, useCallback } from 'react';
import { useInterval } from '../hooks/use-interval';
import { secondsToMinutes } from '../utils/seconds-to-minutes';
import { Button } from './buttons';
import { Timer } from './timer';
import { secondsToTime } from '../utils/seconds-to-time';
// eslint-disable-next-line
const bellStart = require('../sounds/bell-start.mp3');
const bellFinish = require('../sounds/bell-finish.mp3'); // eslint-disable-line

const audioStartWork = new Audio(bellStart);
const audioFinishWork = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = React.useState(props.pomodoroTime);
  const [timeCounting, setTimeCounting] = React.useState(false);
  const [working, setWorking] = React.useState(false);
  const [resting, setResting] = React.useState(false);
  const [cyclesQtdManager, setCyclesQtdManager] = React.useState(new Array(props.cycles - 1).fill(true));

  const [completedCycles, setCompletedCycles] = React.useState(0);
  const [fullWorkingTime, setFullWorkingTime] = React.useState(0);
  const [numberOfPomodoros, setNumberOfPomodoros] = React.useState(0);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (working) setFullWorkingTime(fullWorkingTime + 1);
    },
    timeCounting ? 1000 : null,
  );

  const configureWork = useCallback(() => {
    setTimeCounting(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    audioStartWork.play();
  }, [setTimeCounting, setWorking, setResting, setMainTime, props.pomodoroTime]);

  const configureRest = useCallback(
    (Long: boolean) => {
      setTimeCounting(true);
      setWorking(false);
      setResting(true);

      if (Long) {
        setMainTime(props.longRestTime);
      } else {
        setMainTime(props.shortRestTime);
      }

      audioFinishWork.play();
    },
    [setTimeCounting, setWorking, setResting, setMainTime, props.longRestTime, props.shortRestTime],
  );

  useEffect(() => {
    if (working) document.body.classList.add('working');
    if (resting) document.body.classList.remove('working');

    if (mainTime > 0) return;

    if (working && cyclesQtdManager.length > 0) {
      configureRest(false);
      cyclesQtdManager.pop();
    } else if (working && cyclesQtdManager.length <= 0) {
      configureRest(true);
      setCyclesQtdManager(new Array(props.cycles - 1).fill(true));
      setCompletedCycles(completedCycles + 1);
    }

    if (working) setNumberOfPomodoros(numberOfPomodoros + 1);
    if (resting) configureWork();
  }, [
    working,
    resting,
    mainTime,
    setCyclesQtdManager,
    configureRest,
    configureWork,
    cyclesQtdManager,
    numberOfPomodoros,
    configureWork,
    props.cycles,
    completedCycles,
  ]);

  return (
    <div className='pomodoro'>
      <h2>Você esta {working ? 'trabalhando' : 'descansando'}!</h2>
      <Timer mainTime={mainTime} />

      <div className='controls'>
        <Button text='Iniciar' onClick={() => configureWork()} />
        <Button
          className={!working && !resting ? 'hidden' : ''}
          text={timeCounting ? 'Pausar' : 'Contar'}
          onClick={() => setTimeCounting(!timeCounting)}
        />
        <Button text='Descansar' onClick={() => configureRest(false)} />
      </div>

      <div className='details'>
        <p>Ciclos concluidos: {completedCycles}</p>
        <p>Tempo trabalhado: {secondsToTime(fullWorkingTime)}</p>
        <p>Pomodoros concluidos: {numberOfPomodoros}</p>
      </div>
    </div>
  );
}
