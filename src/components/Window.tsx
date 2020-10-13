// TODO: Resize window via border
// TODO: Minimize window (goes to taskbar)
// TODO: Close window (goes to systray)
// TODO: Desktop taskbar to show minimize/close

import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';

import {
  WINDOW_ANIMATION_MS,
  WINDOW_TITLE_BAR_DRAG,
  WINDOW_BTNS,
  WINDOW_STATES,
} from '../constants';

import './Window.css';

import { ReactComponent as SettingsIcon } from '../assets/images/icons/settings.svg';
import { ReactComponent as MinimizeIcon } from '../assets/images/icons/minimize.svg';
import { ReactComponent as MaximizeIcon } from '../assets/images/icons/maximize.svg';
import { ReactComponent as RestoreIcon } from '../assets/images/icons/restore.svg';
import { ReactComponent as TimesIcon } from '../assets/images/icons/times.svg';
import { getRefNumber } from '../lib/ref';

type WindowProps = {
  width: number;
  height: number;
  icon?: string;
  buttons?: Array<WINDOW_BTNS>;
  children?: React.ReactNode;
} & typeof defaultProps;

const defaultProps = {
  buttons: Object.values(WINDOW_BTNS).filter(
    (btn) => btn !== WINDOW_BTNS.RESTORE
  ),
};

const Window = ({ width, height, icon, buttons, children }: WindowProps) => {
  const windowEl = useRef<HTMLDivElement>(null!);
  const btns = useRef<HTMLDivElement>(null!);
  const timeout = useRef<number>(null!);
  const styleRef = useRef<React.CSSProperties>({ width, height });
  const [state, setState] = useState(WINDOW_STATES.RESTORED);
  const [animating, setAnimating] = useState(false);
  const [prevStyle, setPrevStyle] = useState<React.CSSProperties>({
    width,
    height,
  });
  const [style, _setStyle] = useState<React.CSSProperties>({ width, height });
  const setStyle = (value: React.CSSProperties) => {
    styleRef.current = value;
    _setStyle(value);
  };

  const centralize = () => {
    setStyle({
      ...styleRef.current,
      left: Math.max(window.innerWidth / 2 - width / 2, 0),
      top: Math.max(window.innerHeight / 2 - height / 2, 0),
    });
  };

  const startDrag = (e: React.MouseEvent) => {
    e.persist();
    e.preventDefault();

    let offsetPageX = e.clientX - getRefNumber(styleRef.current.left);
    let offsetPageY = e.clientY - getRefNumber(styleRef.current.top);

    const onMouseMoveDrag = (e: MouseEvent) => {
      e.preventDefault();

      if (!windowEl.current) {
        return;
      }

      const currentWidth = getRefNumber(styleRef.current.width);
      const currentHeight = getRefNumber(styleRef.current.height);
      const { innerWidth, innerHeight } = window;
      let newLeft = e.clientX - offsetPageX;
      let newTop = e.clientY - offsetPageY;

      // Restrict within the window
      if (newLeft < 0) {
        newLeft = 0;
      } else if (newLeft + currentWidth > innerWidth) {
        newLeft = innerWidth - currentWidth;
      }

      if (newTop < 0) {
        newTop = 0;
      } else if (newTop + currentHeight > innerHeight) {
        newTop = innerHeight - currentHeight;
      }

      setStyle({
        ...styleRef.current,
        left: newLeft,
        top: newTop,
      });
    };

    const onMouseUpDrag = () => {
      window.removeEventListener('mousemove', onMouseMoveDrag);
      window.removeEventListener('mouseup', onMouseUpDrag);
    };

    window.addEventListener('mousemove', onMouseMoveDrag);
    window.addEventListener('mouseup', onMouseUpDrag);
  };

  const maximize = async () => {
    if (!buttons.includes(WINDOW_BTNS.MAXIMIZE)) {
      return;
    }

    clearTimeout(timeout.current);
    setAnimating(true);
    setState(WINDOW_STATES.MAXIMIZED);
    setPrevStyle((prevStyle) => ({
      ...prevStyle,
      width: style.width,
      height: style.height,
      left: style.left,
      top: style.top,
    }));
    setStyle({
      ...styleRef.current,
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    });
    timeout.current = window.setTimeout(
      () => setAnimating(false),
      WINDOW_ANIMATION_MS
    );
  };

  const restore = async () => {
    clearTimeout(timeout.current);
    setAnimating(true);
    setState(WINDOW_STATES.RESTORED);
    setStyle({
      ...styleRef.current,
      width: prevStyle.width,
      height: prevStyle.height,
      left: prevStyle.left,
      top: prevStyle.top,
    });
    timeout.current = window.setTimeout(
      () => setAnimating(false),
      WINDOW_ANIMATION_MS
    );
  };

  const maximizeOrRestore =
    state !== WINDOW_STATES.MAXIMIZED ? maximize : restore;

  useEffect(() => {
    centralize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={windowEl}
      className={classNames('window', { animating })}
      style={style}
    >
      <div className="title-bar">
        {icon ? (
          <div
            className="icon"
            style={{ backgroundImage: `url(${icon})` }}
            role="img"
            aria-label="logo"
          ></div>
        ) : null}
        {buttons.length !== 0 ? (
          <div ref={btns} className="btns">
            {buttons.includes(WINDOW_BTNS.SETTINGS) ? (
              <button aria-label={WINDOW_BTNS.SETTINGS}>
                <SettingsIcon />
              </button>
            ) : null}
            {buttons.includes(WINDOW_BTNS.MINIMIZE) ? (
              <button aria-label={WINDOW_BTNS.MINIMIZE}>
                <MinimizeIcon />
              </button>
            ) : null}
            {buttons.includes(WINDOW_BTNS.MAXIMIZE) ? (
              <button
                aria-label={
                  state !== WINDOW_STATES.MAXIMIZED
                    ? WINDOW_BTNS.MAXIMIZE
                    : WINDOW_BTNS.RESTORE
                }
                onClick={maximizeOrRestore}
              >
                {state !== WINDOW_STATES.MAXIMIZED ? (
                  <MaximizeIcon />
                ) : (
                  <RestoreIcon />
                )}
              </button>
            ) : null}
            {buttons.includes(WINDOW_BTNS.CLOSE) ? (
              <button aria-label={WINDOW_BTNS.CLOSE}>
                <TimesIcon />
              </button>
            ) : null}
          </div>
        ) : null}
        <div
          className="draggable"
          aria-label={WINDOW_TITLE_BAR_DRAG}
          onMouseDown={startDrag}
          onDoubleClick={maximizeOrRestore}
        ></div>
      </div>
      <div className="body">{children}</div>
    </div>
  );
};

Window.defaultProps = defaultProps;

export default Window;
