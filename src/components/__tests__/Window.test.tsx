import React from 'react';
import { render, fireEvent, getByRole } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { pixelToNumber } from '../../lib/common';
import Window from '../Window';
import { WINDOW_TITLE_BAR_DRAG, WINDOW_BTNS } from '../../constants';

describe('Window', () => {
  const initProps = {
    width: 600,
    height: 600,
  };
  const initStyle = {
    width: `${initProps.width}px`,
    height: `${initProps.height}px`,
    left: `${Math.max(window.innerWidth / 2 - initProps.width / 2, 0)}px`,
    top: `${Math.max(window.innerHeight / 2 - initProps.height / 2, 0)}px`,
  };
  const children = 'Hello World';

  it('has correct initial style (centralized)', () => {
    const { container } = render(<Window {...initProps} />);
    const windowEl = container.firstChild;

    expect(windowEl).toHaveStyle(initStyle);
  });

  it('accepts children nodes', () => {
    const { getByText } = render(<Window {...initProps}>{children}</Window>);

    expect(getByText(children)).toBeInTheDocument();
  });

  it('accepts icon', () => {
    const icon = 'http://example.com/icon.png';
    const { getByLabelText } = render(<Window {...initProps} icon={icon} />);

    expect(getByLabelText('logo')).toHaveStyle(
      `background-image: url(${icon})`
    );
  });

  it('accepts buttons props 1', () => {
    const { queryByLabelText } = render(<Window {...initProps} buttons={[]} />);

    Object.values(WINDOW_BTNS).forEach((btn) => {
      expect(queryByLabelText(btn)).not.toBeInTheDocument();
    });
  });

  it('accepts buttons props 2', () => {
    const btns = [WINDOW_BTNS.SETTINGS, WINDOW_BTNS.CLOSE];
    const { queryByLabelText } = render(
      <Window {...initProps} buttons={btns} />
    );

    Object.values(WINDOW_BTNS).forEach((btn) => {
      if (btns.includes(btn)) {
        expect(queryByLabelText(btn)).toBeInTheDocument();
      } else {
        expect(queryByLabelText(btn)).not.toBeInTheDocument();
      }
    });
  });

  it(`can ${WINDOW_BTNS.MAXIMIZE} & ${WINDOW_BTNS.RESTORE}`, () => {
    const { container, getByLabelText } = render(<Window {...initProps} />);
    const windowEl = container.firstChild;
    const titleBarDrag = getByLabelText(WINDOW_TITLE_BAR_DRAG);
    const maximizedStyle = {
      width: '100%',
      height: '100%',
    };

    fireEvent.click(getByLabelText(WINDOW_BTNS.MAXIMIZE));
    expect(windowEl).toHaveStyle(maximizedStyle);

    fireEvent.click(getByLabelText(WINDOW_BTNS.RESTORE));
    expect(windowEl).toHaveStyle(initStyle);

    fireEvent.doubleClick(titleBarDrag);
    expect(windowEl).toHaveStyle(maximizedStyle);

    fireEvent.doubleClick(titleBarDrag);
    expect(windowEl).toHaveStyle(initStyle);
  });

  it(`cannot ${WINDOW_BTNS.MAXIMIZE} without the button`, () => {
    const { container, getByLabelText } = render(
      <Window {...initProps} buttons={[]} />
    );
    const windowEl = container.firstChild;

    fireEvent.doubleClick(getByLabelText(WINDOW_TITLE_BAR_DRAG));
    expect(windowEl).toHaveStyle(initStyle);
  });

  it('can be dragged', () => {
    const { container, getByLabelText } = render(<Window {...initProps} />);
    const windowEl = container.firstChild;
    const titleBarDrag = getByLabelText(WINDOW_TITLE_BAR_DRAG);
    let eventProps = {
      clientX: pixelToNumber(initStyle.left),
      clientY: pixelToNumber(initStyle.top),
    };

    fireEvent.mouseDown(titleBarDrag, eventProps);
    eventProps = {
      clientX: 10,
      clientY: 20,
    };
    fireEvent.mouseMove(titleBarDrag, eventProps);
    fireEvent.mouseUp(titleBarDrag);

    expect(windowEl).toHaveStyle({
      left: `${eventProps.clientX}px`,
      top: `${eventProps.clientY}px`,
    });

    fireEvent.mouseDown(titleBarDrag, eventProps);
    eventProps = {
      clientX: 30,
      clientY: 15,
    };
    fireEvent.mouseMove(titleBarDrag, eventProps);
    fireEvent.mouseUp(titleBarDrag);

    expect(windowEl).toHaveStyle({
      left: `${eventProps.clientX}px`,
      top: `${eventProps.clientY}px`,
    });
  });

  it('cannot be dragged outside the window', () => {
    const { container, getByLabelText } = render(<Window {...initProps} />);
    const windowEl = container.firstChild;
    const titleBarDrag = getByLabelText(WINDOW_TITLE_BAR_DRAG);
    let eventProps = {
      clientX: pixelToNumber(initStyle.left),
      clientY: pixelToNumber(initStyle.top),
    };

    fireEvent.mouseDown(titleBarDrag, eventProps);
    fireEvent.mouseMove(titleBarDrag, {
      clientX: -1,
      clientY: -1,
    });
    fireEvent.mouseUp(titleBarDrag);

    expect(windowEl).toHaveStyle({
      left: 0,
      top: 0,
    });

    fireEvent.mouseDown(titleBarDrag, {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.mouseMove(titleBarDrag, {
      clientX: window.innerWidth,
      clientY: window.innerHeight,
    });
    fireEvent.mouseUp(titleBarDrag);

    expect(windowEl).toHaveStyle({
      left: `${window.innerWidth - initProps.width}px`,
      top: `${window.innerHeight - initProps.height}px`,
    });
  });
});
