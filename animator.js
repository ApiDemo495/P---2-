const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const REST = { tip: [.55, .62], body: [.58, .58], velum: 'raised', lips: 'neutral', jaw: .16, rotation: 0, voiced: false, aspirated: false, nasal: false };

function copyPose(pose) {
  return { ...pose, tip: [...pose.tip], body: [...pose.body] };
}

export class AnatomyAnimator {
  constructor(scene) {
    this.scene = scene;
    this.tongue = scene.querySelector('.anatomy-tongue');
    this.tongueShadow = scene.querySelector('.tongue-shadow');
    this.tongueHighlight = scene.querySelector('.tongue-highlight');
    this.tipMarker = scene.querySelector('.tongue-tip');
    this.estimateMarker = scene.querySelector('.estimated-tongue');
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
    this.estimate = {
      tip: [.51 + (1 - front) * .07, .55 - height * .13],
      body: [.63 - front * .13, .59 - height * .18],
    };
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

  tonguePath(pose) {
    const tipX = 846 + (pose.tip[0] - .55) * 250;
    const tipY = 510 + (pose.tip[1] - .62) * 210;
    const bodyX = 754 + (pose.body[0] - .58) * 180;
    const bodyY = 548 + (pose.body[1] - .58) * 190;
    return `M 690 568 C 706 544, ${bodyX - 30} ${bodyY - 10}, ${bodyX} ${bodyY} C ${bodyX + 42} ${bodyY - 46}, ${tipX - 32} ${tipY + 16}, ${tipX} ${tipY} Q ${tipX + 20} ${tipY + 8}, 852 540 C 826 577, 783 599, 741 595 Q 705 590, 690 568 Z`;
  }

  render(now) {
    const path = this.tonguePath(this.current);
    this.tongue?.setAttribute('d', path);
    this.tongueShadow?.setAttribute('d', path);
    this.tongueHighlight?.setAttribute('d', `M 713 570 Q ${760 + (this.current.body[0] - .58) * 100} ${548 + (this.current.body[1] - .58) * 80}, ${846 + (this.current.tip[0] - .55) * 220} ${514 + (this.current.tip[1] - .5) * 220}`);
    if (this.tipMarker) {
      this.tipMarker.setAttribute('cx', String(846 + (this.current.tip[0] - .55) * 250));
      this.tipMarker.setAttribute('cy', String(512 + (this.current.tip[1] - .5) * 260));
    }
    if (this.estimateMarker && this.estimate) this.estimateMarker.setAttribute('d', this.tonguePath(this.estimate));
    this.scene.dataset.airflow = this.nasalLeak ? 'leak' : this.current.nasal ? 'nasal' : 'oral';
    const guide = this.scene.closest('.coach-loop')?.querySelector('#guide-progress');
    if (guide && this.sequence) guide.style.width = `${((now - this.sequenceStart) % this.sequenceDuration) / this.sequenceDuration * 100}%`;
    this.scene.dataset.velum = this.nasalLeak ? 'leak' : this.current.velum;
    this.scene.dataset.lips = this.current.lips;
    this.scene.dataset.voiced = String(!!this.current.voiced);
    this.scene.classList.toggle('is-aspirated', !!this.current.aspirated && now - this.start < 700);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.sequence = null;
  }
}
