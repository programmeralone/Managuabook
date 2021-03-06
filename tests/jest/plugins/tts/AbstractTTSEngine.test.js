import sinon from 'sinon';
import { afterEventLoop } from '../../utils.js';
import AbstractTTSEngine from '@/src/plugins/tts/AbstractTTSEngine.js';
import PageChunkIterator from '@/src/plugins/tts/PageChunkIterator.js';
/** @typedef {import('@/src/plugins/tts/AbstractTTSEngine.js').TTSEngineOptions} TTSEngineOptions */

// Skipping because it's flaky. Fix in #672
describe.skip('AbstractTTSEngine', () => {
  test('stops playing once done', () => {
    class DummyEngine extends AbstractTTSEngine {
      getVoices() { return []; }
    }
    const d = new DummyEngine(DUMMY_TTS_ENGINE_OPTS);
    d._chunkIterator = { next: sinon.stub().resolves(PageChunkIterator.AT_END) };
    const stopStub = sinon.stub(d, 'stop');
    expect(stopStub.callCount).toBe(0);
    d.step();
    return afterEventLoop()
      .then(() => expect(stopStub.callCount).toBe(1));
  });
});

for (const dummyVoice of [dummyVoice, dummyVoiceUnderscores]) {
  describe(`getBestBookVoice with BCP47 ${dummyVoice == dummyVoiceUnderscores ? '+' : '-'} underscores`, () => {
    const { getBestBookVoice } = AbstractTTSEngine;

    test('undefined if no voices', () => {
      expect(getBestBookVoice([], 'en', [])).toBe(undefined);
    });

    test('returns first voice if no matching', () => {
      const enVoice = dummyVoice({lang: "en-US"});
      expect(getBestBookVoice([enVoice], 'fr', [])).toBe(enVoice);
    });

    test('choose first matching voice', () => {
      const voices = [
        dummyVoice({lang: "en-GB"}),
        dummyVoice({lang: "en-US"}),
      ];
      expect(getBestBookVoice(voices, 'en', [])).toBe(voices[0]);
    });

    test('choose first matching default voice', () => {
      const voices = [
        dummyVoice({lang: "en-GB"}),
        dummyVoice({lang: "en-US", default: true}),
      ];
      expect(getBestBookVoice(voices, 'en', [])).toBe(voices[1]);
    });

    test('does not choose default if better language match exists', () => {
      const voices = [
        dummyVoice({lang: "en-US", default: true}),
        dummyVoice({lang: "fr-FR"}),
      ];
      expect(getBestBookVoice(voices, 'fr', [])).toBe(voices[1]);
    });

    test('choose users dialect if present', () => {
      const voices = [
        dummyVoice({lang: "en-GB"}),
        dummyVoice({lang: "en-CA"}),
        dummyVoice({lang: "en-US"}),
      ];
      expect(getBestBookVoice(voices, 'en', ['en-CA', 'en'])).toBe(voices[1]);
    });

    test('choose users dialect even if not default', () => {
      const voices = [
        dummyVoice({lang: "en-US", default: true}),
        dummyVoice({lang: "en-GB"}),
        dummyVoice({lang: "en-CA"}),
      ];
      expect(getBestBookVoice(voices, 'en', ['en-CA', 'en'])).toBe(voices[2]);
    });

    test('choose language even if dialect does not match', () => {
      const voices = [
        dummyVoice({lang: "en-GB"}),
      ];
      expect(getBestBookVoice(voices, 'en', ['en-CA'])).toBe(voices[0]);
    });

    test('real world example', () => {
      // Chrome 77 @ Windows 10
      const voices = [
        { default: true, lang: "en-US", name: "Microsoft David Desktop - English (United States)", localService: true, voiceURI: "Microsoft David Desktop - English (United States)" },
        { default: false, lang: "de-DE", name: "Microsoft Hedda Desktop - German", localService: true, voiceURI: "Microsoft Hedda Desktop - German" },
        { default: false, lang: "en-US", name: "Microsoft Zira Desktop - English (United States)", localService: true, voiceURI: "Microsoft Zira Desktop - English (United States)" },
        { default: false, lang: "de-DE", name: "Google Deutsch", localService: false, voiceURI: "Google Deutsch" },
        { default: false, lang: "en-US", name: "Google US English", localService: false, voiceURI: "Google US English" },
        { default: false, lang: "en-GB", name: "Google UK English Female", localService: false, voiceURI: "Google UK English Female" },
        { default: false, lang: "en-GB", name: "Google UK English Male", localService: false, voiceURI: "Google UK English Male" },
        { default: false, lang: "es-ES", name: "Google espa??ol", localService: false, voiceURI: "Google espa??ol" },
        { default: false, lang: "es-US", name: "Google espa??ol de Estados Unidos", localService: false, voiceURI: "Google espa??ol de Estados Unidos" },
        { default: false, lang: "fr-FR", name: "Google fran??ais", localService: false, voiceURI: "Google fran??ais" },
        { default: false, lang: "hi-IN", name: "Google ??????????????????", localService: false, voiceURI: "Google ??????????????????" },
        { default: false, lang: "id-ID", name: "Google Bahasa Indonesia", localService: false, voiceURI: "Google Bahasa Indonesia" },
        { default: false, lang: "it-IT", name: "Google italiano", localService: false, voiceURI: "Google italiano" },
        { default: false, lang: "ja-JP", name: "Google ?????????", localService: false, voiceURI: "Google ?????????" },
        { default: false, lang: "ko-KR", name: "Google ?????????", localService: false, voiceURI: "Google ?????????" },
        { default: false, lang: "nl-NL", name: "Google Nederlands", localService: false, voiceURI: "Google Nederlands" },
        { default: false, lang: "pl-PL", name: "Google polski", localService: false, voiceURI: "Google polski" },
        { default: false, lang: "pt-BR", name: "Google portugu??s do Brasil", localService: false, voiceURI: "Google portugu??s do Brasil" },
        { default: false, lang: "ru-RU", name: "Google ??????????????", localService: false, voiceURI: "Google ??????????????" },
        { default: false, lang: "zh-CN", name: "Google?????????????????????????????", localService: false, voiceURI: "Google?????????????????????????????" },
        { default: false, lang: "zh-HK", name: "Google????????????????????", localService: false, voiceURI: "Google????????????????????" },
        { default: false, lang: "zh-TW", name: "Google ??????????????????", localService: false, voiceURI: "Google ??????????????????" }
      ];

      expect(getBestBookVoice(voices, 'en', ['en-CA', 'en'])).toBe(voices[0]);
    });
  });
}

/** @type {TTSEngineOptions} */
export const DUMMY_TTS_ENGINE_OPTS = {
  server: 'blah',
  bookPath: 'blah',
  bookLanguage: 'blah',
  onLoadingStart() {},
  onLoadingComplete() {},
  onDone() {},
  beforeChunkPlay() { return Promise.resolve(); },
  afterChunkPlay() {},
};

/**
 * @param {SpeechSynthesisVoice}
 * @return {SpeechSynthesisVoice}
 **/
function dummyVoice(overrides) {
  return Object.assign({
    default: false,
    lang: "en-US",
    name: "Microsoft David",
    localService: false,
    voiceURI: "",
  }, overrides);
}

/**
 * Construct a voice-like object using underscores instead of hyphenes
 * (Like Chrome/Android)
 * @param {SpeechSynthesisVoice}
 * @return {SpeechSynthesisVoice}
 **/
function dummyVoiceUnderscores(overrides) {
  const voice = dummyVoice(overrides);
  voice.lang = voice.lang.replace('-', '_');
  return voice;
}
