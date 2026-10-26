const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const REST = { tip: [.55, .62], body: [.58, .58], velum: 'raised', lips: 'neutral', jaw: .16, rotation: 0, voiced: false, aspirated: false, nasal: false };
const copyPose = pose => ({ ...pose, tip: [...pose.tip], body: [...pose.body] });

export class AnatomyAnimator {
  constructor(scene) {
    this.scene = scene;
    this.tongues = [...scene.querySelectorAll('.anatomy-tongue')];
    this.shadows = [...scene.querySelectorAll('.tongue-shadow')];
    this.highlights = [...scene.querySelectorAll('.tongue-highlight')];
    this.tipMarkers = [...scene.querySelectorAll('.tongue-tip')];
    this.estimates = [...scene.querySelectorAll('.estimated-tongue')];
    this.current = copyPose(REST);
    this.from = copyPose(REST);
    this.target = copyPose(REST);
    this.start = performance.now();
    this.duration = 0;
    this.sequence = null;
    this.sequenceStart = this.start;
    this.sequenceIndex = -1;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mirror = false;
    this.nasalLeak = false;
    this.estimate = null;
    this.destroyed = false;
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
    this.render(this.start);
  }

  setTarget(pose = {}, duration = 650) {
    this.from = copyPose(this.current);
    this.target = {
      ...REST,
      ...pose,
      tip: pose.tip ? [...pose.tip] : [...this.current.tip],
      body: pose.body ? [...pose.body] : [...this.current.body],
    };
    this.start = performance.now();
    this.duration = this.reduced ? 0 : Math.max(0, duration);
    if (this.target.aspirated) this.scene.classList.add('is-aspirated');
  }

  setSequence(sequence, duration = 30_000) {
    this.sequence = !this.reduced && Array.isArray(sequence) && sequence.length ? sequence : null;
    this.sequenceDuration = duration;
    this.sequenceStart = performance.now();
    this.sequenceIndex = -1;
  }

  setMirror(value) {
    this.mirror = !!value;
    this.scene.classList.toggle('is-mirrored', this.mirror);
  }

  setNasalLeak(value) {
    this.nasalLeak = !!value;
    this.scene.classList.toggle('nasal-leak', this.nasalLeak);
  }

  setEstimate(formants) {
    if (!formants) {
      this.estimate = null;
      this.scene.classList.remove('has-estimate');
      return;
    }
    const front = formants.frontness ?? .5;
    const height = formants.height ?? .5;
    this.estimate = { tip: [.51 + (1 - front) * .07, .55 - height * .13], body: [.63 - front * .13, .59 - height * .18] };
    this.scene.classList.add('has-estimate');
  }

  loop(now) {
    if (this.destroyed) return;
    if (this.sequence) {
      const progress = ((now - this.sequenceStart) % this.sequenceDuration) / this.sequenceDuration;
      const index = Math.min(this.sequence.length - 1, Math.floor(progress * this.sequence.length));
      if (index !== this.sequenceIndex) {
        this.sequenceIndex = index;
        const cue = this.scene.closest('.coach-loop')?.querySelector('#coach-cue');
        if (cue && this.sequence[index].label) cue.textContent = this.sequence[index].label;
        this.setTarget(this.sequence[index].pose, this.reduced ? 0 : 900);
      }
    }

    const t = this.duration ? clamp((now - this.start) / this.duration, 0, 1) : 1;
    const eased = 1 - Math.pow(1 - t, 3);
    const mix = (a, b) => a + (b - a) * eased;
    this.current.tip = this.from.tip.map((value, index) => mix(value, this.target.tip[index]));
    this.current.body = this.from.body.map((value, index) => mix(value, this.target.body[index]));
    this.current.jaw = mix(this.from.jaw ?? REST.jaw, this.target.jaw ?? REST.jaw);
    this.current.velum = t < 1 ? this.from.velum : this.target.velum;
    this.current.lips = t < 1 ? this.from.lips : this.target.lips;
    this.current.voiced = this.target.voiced;
    this.current.aspirated = this.target.aspirated;
    this.current.nasal = this.target.nasal;
    this.render(now);
    this.raf = requestAnimationFrame(this.loop);
  }

  sideTonguePath(pose) {
    const tipX = 846 + (pose.tip[0] - .55) * 250;
    const tipY = 510 + (pose.tip[1] - .62) * 210;
    const bodyX = 754 + (pose.body[0] - .58) * 180;
    const bodyY = 548 + (pose.body[1] - .58) * 190;
    return `M 690 568 C 706 544, ${bodyX - 30} ${bodyY - 10}, ${bodyX} ${bodyY} C ${bodyX + 42} ${bodyY - 46}, ${tipX - 32} ${tipY + 16}, ${tipX} ${tipY} Q ${tipX + 20} ${tipY + 8}, 852 540 C 826 577, 783 599, 741 595 Q 705 590, 690 568 Z`;
  }

  frontTonguePath(pose) {
    const lateral = (pose.tip[0] - .55) * 225 + (pose.body[0] - .58) * 45;
    const lift = (.62 - pose.tip[1]) * 72 + (.58 - pose.body[1]) * 20;
    const left = 610 + lateral * .28;
    const mid = 704 + lateral;
    const right = 797 + lateral * .55;
    return `M ${left} 587 C ${left + 9} ${535 - lift * .25}, ${mid - 47} ${493 - lift}, ${mid} ${485 - lift} C ${mid + 44} ${477 - lift}, ${right} ${510 - lift * .35}, ${right} ${551 - lift * .1} C ${right + 1} ${594 + lift * .12}, ${mid + 43} ${640 + lift * .2}, ${mid} ${650 + lift * .2} C ${mid - 45} ${658 + lift * .15}, ${left + 13} 635, ${left} 587 Z`;
  }

  pathFor(profile, pose) {
    return profile === 'front' ? this.frontTonguePath(pose) : this.sideTonguePath(pose);
  }

  render(now) {
    this.tongues.forEach(element => {
      const profile = element.closest('.anatomy-front') ? 'front' : 'side';
      element.setAttribute('d', this.pathFor(profile, this.current));
    });
    this.shadows.forEach(element => element.setAttribute('d', this.sideTonguePath(this.current)));
    this.highlights.forEach(element => {
      const profile = element.closest('.anatomy-front') ? 'front' : 'side';
      if (profile === 'front') {
        const shift = (this.current.tip[0] - .55) * 190;
        element.setAttribute('d', `M ${660 + shift} ${575 - (this.current.tip[1] - .62) * 40} Q ${700 + shift} ${532 - (this.current.body[1] - .58) * 24}, ${750 + shift} ${548 - (this.current.tip[1] - .62) * 35}`);
      } else {
        const x = 846 + (this.current.tip[0] - .55) * 220;
        const y = 514 + (this.current.tip[1] - .5) * 220;
        element.setAttribute('d', `M 713 570 Q ${760 + (this.current.body[0] - .58) * 100} ${548 + (this.current.body[1] - .58) * 80}, ${x} ${y}`);
      }
    });
    this.tipMarkers.forEach(element => {
      if (element.closest('.anatomy-front')) {
        element.setAttribute('cx', String(704 + (this.current.tip[0] - .55) * 225 + (this.current.body[0] - .58) * 45));
        element.setAttribute('cy', String(485 - (.62 - this.current.tip[1]) * 72));
      } else {
        element.setAttribute('cx', String(846 + (this.current.tip[0] - .55) * 250));
        element.setAttribute('cy', String(510 + (this.current.tip[1] - .62) * 210));
      }
    });
    if (this.estimate) this.estimates.forEach(element => element.setAttribute('d', this.pathFor(element.closest('.anatomy-front') ? 'front' : 'side', this.estimate)));
    this.scene.dataset.airflow = this.nasalLeak ? 'leak' : this.current.nasal ? 'nasal' : 'oral';
    this.scene.dataset.velum = this.nasalLeak ? 'leak' : this.current.velum;
    this.scene.dataset.lips = this.current.lips;
    this.scene.dataset.voiced = String(!!this.current.voiced);
    this.scene.classList.toggle('is-aspirated', !!this.current.aspirated && now - this.start < 700);
    const guide = this.scene.closest('.coach-loop')?.querySelector('#guide-progress');
    if (guide && this.sequence) guide.style.width = `${((now - this.sequenceStart) % this.sequenceDuration) / this.sequenceDuration * 100}%`;
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.sequence = null;
  }
}
