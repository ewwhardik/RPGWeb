"use client";

const flickerZero = [1, 6, 7, 8, 11, 12, 13, 18];

export default function GhostAccent() {
  return (
    <div className="ghost-accent" aria-hidden="true">
      <div className="ghost-accent__body">
        <div className="ghost-accent__pupil ghost-accent__pupil--left" />
        <div className="ghost-accent__pupil ghost-accent__pupil--right" />
        <div className="ghost-accent__eye ghost-accent__eye--left" />
        <div className="ghost-accent__eye ghost-accent__eye--right" />
        <div className="ghost-accent__top ghost-accent__top--0" />
        <div className="ghost-accent__top ghost-accent__top--1" />
        <div className="ghost-accent__top ghost-accent__top--2" />
        <div className="ghost-accent__top ghost-accent__top--3" />
        <div className="ghost-accent__top ghost-accent__top--4" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={`st-${index}`} className={`ghost-accent__stem ghost-accent__stem--${index}`} />
        ))}
        {Array.from({ length: 18 }, (_, index) => {
          const number = index + 1;
          const flickerClass = flickerZero.includes(number) ? "ghost-accent__flicker--zero" : "ghost-accent__flicker--one";
          return <div key={`an-${number}`} className={`ghost-accent__flicker ghost-accent__flicker--${number} ${flickerClass}`} />;
        })}
      </div>
      <div className="ghost-accent__shadow" />
    </div>
  );
}
