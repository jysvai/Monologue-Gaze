"""조연 목소리 나이 · 성별 재기 — 지은 목소리가 설명(나이 · 성별)과 맞는지 고를 때 쓴다. tools/voices-vox.js 가 부른다.

  <venv python> tools/vox-age.py checks.json
checks.json: [{ "key", "wav" }] → 줄마다 {"key", "age": 나이(해), "f": 여자일 확률, "m": 남자일 확률}
모델: audeering/wav2vec2-large-robust-24-ft-age-gender (CC BY-NC-SA 4.0) — 만들 때 재는 데만 쓰고 게임에는 넣지 않는다.
"""
import json
import sys

import librosa
import torch
import torch.nn as nn
from transformers import Wav2Vec2Model, Wav2Vec2PreTrainedModel, Wav2Vec2Processor

NAME = "audeering/wav2vec2-large-robust-24-ft-age-gender"


class Head(nn.Module):
    def __init__(self, config, n):
        super().__init__()
        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        self.dropout = nn.Dropout(config.final_dropout)
        self.out_proj = nn.Linear(config.hidden_size, n)

    def forward(self, x):
        return self.out_proj(self.dropout(torch.tanh(self.dense(self.dropout(x)))))


class AgeGender(Wav2Vec2PreTrainedModel):
    def __init__(self, config):
        super().__init__(config)
        self.wav2vec2 = Wav2Vec2Model(config)
        self.age = Head(config, 1)
        self.gender = Head(config, 3)
        self.post_init()

    def forward(self, x):
        h = self.wav2vec2(x)[0].mean(dim=1)
        return self.age(h), torch.softmax(self.gender(h), dim=1)


def main():
    items = json.load(open(sys.argv[1], encoding="utf-8"))
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    proc = Wav2Vec2Processor.from_pretrained(NAME)
    model = AgeGender.from_pretrained(NAME).to(dev).eval()
    for it in items:
        y, _ = librosa.load(it["wav"], sr=16000, mono=True)
        y, _ = librosa.effects.trim(y, top_db=35)
        x = torch.from_numpy(proc(y, sampling_rate=16000)["input_values"][0]).reshape(1, -1).to(dev)
        with torch.no_grad():
            age, g = model(x)
        f, m, _c = g[0].tolist()
        print(json.dumps({"key": it["key"], "age": round(float(age[0][0]) * 100, 1), "f": round(f, 3), "m": round(m, 3)}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
