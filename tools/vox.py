"""조연 목소리 (VoxCPM2, 로컬 · Apache-2.0) — tools/voices-vox.js 가 부른다.

  <venv python> tools/vox.py jobs.json

jobs.json: [{ "key", "text", "out": wav 경로, "seed",
              "desc": 목소리 설명 (목소리를 처음 지을 때: 대사 앞 괄호로 붙는다),
              "ref": 견본 wav, "ref_text": 견본이 읽은 글자 (지은 목소리를 다른 대사에 이어 쓸 때),
              "control": 어조 지시 (있으면 견본에서 목소리 결만 받고 이 어조로 읽는다) }]
한 줄 끝날 때마다 {"key", "ok", "secs"} 를 한 줄 JSON 으로 찍는다.
ElevenLabs 는 주연에만 쓴다: 한 사람 안에서 두 엔진을 섞지 않는다 (음질이 달라 바로 티가 난다).
"""
import json
import sys
import time

import soundfile as sf
import torch
from voxcpm import VoxCPM


def main():
    jobs = json.load(open(sys.argv[1], encoding="utf-8"))
    model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
    sr = model.tts_model.sample_rate
    for j in jobs:
        t0 = time.time()
        try:
            torch.manual_seed(j.get("seed", 42))  # 같은 씨앗이면 같은 소리 (2.0.3 의 generate 는 seed 를 받지 않는다)
            kw = dict(cfg_value=j.get("cfg", 2.0), inference_timesteps=j.get("steps", 10))
            if j.get("ref") and j.get("control"):  # 목소리 결만 견본에서 받고, 어조는 괄호 지시로 (이어 말하기는 견본의 기분까지 따라온다)
                kw.update(reference_wav_path=j["ref"])
                text = f"({j['control']}){j['text']}"
            elif j.get("ref"):
                kw.update(prompt_wav_path=j["ref"], prompt_text=j["ref_text"], reference_wav_path=j["ref"])
                text = j["text"]
            else:
                text = f"({j['desc']}){j['text']}" if j.get("desc") else j["text"]
            wav = model.generate(text=text, **kw)
            sf.write(j["out"], wav, sr)
            print(json.dumps({"key": j["key"], "ok": True, "secs": round(len(wav) / sr, 2), "took": round(time.time() - t0, 1)}, ensure_ascii=False), flush=True)
        except Exception as e:  # 한 줄이 틀려도 나머지는 만든다
            print(json.dumps({"key": j["key"], "ok": False, "err": str(e)[:300]}, ensure_ascii=False), flush=True)
        if torch.cuda.is_available():
            torch.cuda.empty_cache()


if __name__ == "__main__":
    main()
