import { Center, Spinner } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const ResourcePage = lazy(() =>
  import("@/pages/ResourcePage").then((module) => ({
    default: module.ResourcePage,
  })),
);
const DetailPage = lazy(() =>
  import("@/pages/DetailPage").then((module) => ({
    default: module.DetailPage,
  })),
);
const StudyPage = lazy(() =>
  import("@/pages/StudyPage").then((module) => ({ default: module.StudyPage })),
);
const ReviewPage = lazy(() =>
  import("@/pages/ReviewPage").then((module) => ({
    default: module.ReviewPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);

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
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="vocabularies"
              element={<ResourcePage fixedResource="vocabularies" />}
            />
            <Route
              path="vocabularies/:id"
              element={<DetailPage fixedResource="vocabularies" />}
            />
            <Route
              path="collections"
              element={<ResourcePage fixedResource="collections" />}
            />
            <Route path="collections/:id/study" element={<StudyPage />} />
            <Route
              path="collections/:id/test"
              element={<StudyPage testMode />}
            />
            <Route
              path="grammars"
              element={<ResourcePage fixedResource="grammars" />}
            />
            <Route
              path="grammars/:id"
              element={<DetailPage fixedResource="grammars" />}
            />
            <Route
              path="sentences"
              element={<ResourcePage fixedResource="sentences" />}
            />
            <Route
              path="sentences/:id"
              element={<DetailPage fixedResource="sentences" />}
            />
            <Route path="review/:mode" element={<ReviewPage />} />
            <Route
              path="manage/imports"
              element={<ResourcePage fixedResource="imports" />}
            />
            <Route
              path="manage/tags"
              element={<ResourcePage fixedResource="tags" />}
            />
            <Route
              path="manage/parts-of-speech"
              element={<ResourcePage fixedResource="parts-of-speech" />}
            />
            <Route path="manage/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
