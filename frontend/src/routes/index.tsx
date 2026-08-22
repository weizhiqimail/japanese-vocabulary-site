import { Center, Spinner } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layout/app';
import { ProtectedRoute } from './ProtectedRoute';

const Login = lazy(() =>
  import('@/pages/login').then((module) => ({ default: module.Login })),
);
const Home = lazy(() =>
  import('@/pages/home').then((module) => ({ default: module.Home })),
);
const Collections = lazy(() =>
  import('@/pages/collections').then((module) => ({
    default: module.Collections,
  })),
);
const Vocabularies = lazy(() =>
  import('@/pages/vocabularies').then((module) => ({
    default: module.Vocabularies,
  })),
);
const VocabularyDetail = lazy(() =>
  import('@/pages/vocabulary-detail').then((module) => ({
    default: module.VocabularyDetail,
  })),
);
const Grammars = lazy(() =>
  import('@/pages/grammars').then((module) => ({ default: module.Grammars })),
);
const GrammarDetail = lazy(() =>
  import('@/pages/grammar-detail').then((module) => ({
    default: module.GrammarDetail,
  })),
);
const Sentences = lazy(() =>
  import('@/pages/sentences').then((module) => ({ default: module.Sentences })),
);
const SentenceDetail = lazy(() =>
  import('@/pages/sentence-detail').then((module) => ({
    default: module.SentenceDetail,
  })),
);
const CollectionStudy = lazy(() =>
  import('@/pages/collection-study').then((module) => ({
    default: module.CollectionStudy,
  })),
);
const CollectionTest = lazy(() =>
  import('@/pages/collection-test').then((module) => ({
    default: module.CollectionTest,
  })),
);
const Review = lazy(() =>
  import('@/pages/review').then((module) => ({ default: module.Review })),
);
const Tags = lazy(() =>
  import('@/pages/tags').then((module) => ({ default: module.Tags })),
);
const PartsOfSpeech = lazy(() =>
  import('@/pages/parts-of-speech').then((module) => ({
    default: module.PartsOfSpeech,
  })),
);
const Settings = lazy(() =>
  import('@/pages/settings').then((module) => ({ default: module.Settings })),
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
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:id/study" element={<CollectionStudy />} />
            <Route path="collections/:id/test" element={<CollectionTest />} />
            <Route path="vocabularies" element={<Vocabularies />} />
            <Route path="vocabularies/:id" element={<VocabularyDetail />} />
            <Route path="grammars" element={<Grammars />} />
            <Route path="grammars/:id" element={<GrammarDetail />} />
            <Route path="sentences" element={<Sentences />} />
            <Route path="sentences/:id" element={<SentenceDetail />} />
            <Route path="review/:mode" element={<Review />} />
            <Route
              path="manage"
              element={<Navigate to="/manage/tags" replace />}
            />
            <Route path="manage/tags" element={<Tags />} />
            <Route path="manage/parts-of-speech" element={<PartsOfSpeech />} />
            <Route path="manage/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
