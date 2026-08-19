import { Center, Spinner } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layout/app";
import { ProtectedRoute } from "./ProtectedRoute";

const Login = lazy(() =>
  import("@/pages/login").then((module) => ({ default: module.Login })),
);
const Home = lazy(() =>
  import("@/pages/home").then((module) => ({ default: module.Home })),
);
const Collections = lazy(() =>
  import("@/pages/collections").then((module) => ({
    default: module.Collections,
  })),
);
const Vocabularies = lazy(() =>
  import("@/pages/vocabularies").then((module) => ({
    default: module.Vocabularies,
  })),
);
const VocabularyDetail = lazy(() =>
  import("@/pages/vocabulary-detail").then((module) => ({
    default: module.VocabularyDetail,
  })),
);
const Grammars = lazy(() =>
  import("@/pages/grammars").then((module) => ({ default: module.Grammars })),
);
const GrammarDetail = lazy(() =>
  import("@/pages/grammar-detail").then((module) => ({
    default: module.GrammarDetail,
  })),
);
const Sentences = lazy(() =>
  import("@/pages/sentences").then((module) => ({ default: module.Sentences })),
);
const SentenceDetail = lazy(() =>
  import("@/pages/sentence-detail").then((module) => ({
    default: module.SentenceDetail,
  })),
);
const CollectionStudy = lazy(() =>
  import("@/pages/collection-study").then((module) => ({
    default: module.CollectionStudy,
  })),
);
const CollectionTest = lazy(() =>
  import("@/pages/collection-test").then((module) => ({
    default: module.CollectionTest,
  })),
);
const Review = lazy(() =>
  import("@/pages/review").then((module) => ({ default: module.Review })),
);
const Tags = lazy(() =>
  import("@/pages/tags").then((module) => ({ default: module.Tags })),
);
const PartsOfSpeech = lazy(() =>
  import("@/pages/parts-of-speech").then((module) => ({
    default: module.PartsOfSpeech,
  })),
);
const Settings = lazy(() =>
  import("@/pages/settings").then((module) => ({ default: module.Settings })),
);
const QuestionBanks = lazy(() =>
  import("@/pages/question-banks").then((module) => ({
    default: module.QuestionBanks,
  })),
);
const QuestionBankDetail = lazy(() =>
  import("@/pages/question-bank-detail").then((module) => ({
    default: module.QuestionBankDetail,
  })),
);
const QuestionPractice = lazy(() =>
  import("@/pages/question-practice").then((module) => ({
    default: module.QuestionPractice,
  })),
);

/** 每条页面路由均对应一个独立页面级组件。 */
export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <Center minH="40vh">
          <Spinner size="xl" color="brand.500" />
        </Center>
      }
    >
      <Routes>
        <Route path="/account/login" element={<Login />} />
        <Route
          path="/login"
          element={<Navigate to="/account/login" replace />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/words" replace />} />
            <Route path="words" element={<Home />} />
            <Route path="words/words/collections" element={<Collections />} />
            <Route
              path="words/words/collections/:id/words/study"
              element={<CollectionStudy />}
            />
            <Route
              path="words/words/collections/:id/test"
              element={<CollectionTest />}
            />
            <Route path="words/words/vocabularies" element={<Vocabularies />} />
            <Route
              path="words/words/vocabularies/:id"
              element={<VocabularyDetail />}
            />
            <Route path="words/words/grammars" element={<Grammars />} />
            <Route
              path="words/words/grammars/:id"
              element={<GrammarDetail />}
            />
            <Route path="words/words/sentences" element={<Sentences />} />
            <Route
              path="words/words/sentences/:id"
              element={<SentenceDetail />}
            />
            <Route path="words/words/review/:mode" element={<Review />} />
            <Route
              path="words/words/manage"
              element={<Navigate to="/words/manage/words/tags" replace />}
            />
            <Route path="words/words/manage/words/tags" element={<Tags />} />
            <Route
              path="words/words/manage/words/parts-of-speech"
              element={<PartsOfSpeech />}
            />
            <Route
              path="words/words/manage/words/settings"
              element={<Settings />}
            />
            <Route path="questions" element={<QuestionBanks />} />
            <Route
              path="questions/banks/:id"
              element={<QuestionBankDetail />}
            />
            <Route
              path="questions/banks/:id/practice"
              element={<QuestionPractice />}
            />
            <Route
              path="questions/banks/:id/errors"
              element={<QuestionPractice />}
            />
            <Route
              path="questions/banks/:id/favorites"
              element={<QuestionPractice />}
            />
            <Route
              path="collections/*"
              element={<Navigate to="/words/collections" replace />}
            />
            <Route
              path="vocabularies/*"
              element={<Navigate to="/words/vocabularies" replace />}
            />
            <Route
              path="grammars/*"
              element={<Navigate to="/words/grammars" replace />}
            />
            <Route
              path="sentences/*"
              element={<Navigate to="/words/sentences" replace />}
            />
            <Route
              path="review/*"
              element={<Navigate to="/words/review/errors" replace />}
            />
            <Route
              path="manage/*"
              element={<Navigate to="/words/manage/words/tags" replace />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/words" replace />} />
      </Routes>
    </Suspense>
  );
}
