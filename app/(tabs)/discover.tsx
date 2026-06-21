import { router } from "expo-router";
import { BodyText, Button, Card, Notice, Screen, SectionTitle, Tag } from "../../src/components/ui";
import { ageRangeLabels, concernLabels, skinTypeLabels } from "../../src/copy/ko";
import { creators } from "../../src/data/creators";
import { useAppState } from "../../src/state/AppContext";

export default function DiscoverScreen() {
  const { state, dispatch } = useAppState();

  return (
    <Screen eyebrow="Discover" title="Public vanities, filtered for you." subtitle="다른 사람의 공개 화장대를 그대로 따라 사지 말고, 내 피부 기준으로 다시 보세요.">
      <Notice>모든 공개 화장대는 데모 데이터이며 실제 사용자, 실제 브랜드, 실제 전성분처럼 주장하지 않아요.</Notice>
      {creators.map((creator, index) => {
        const followed = state.followedCreatorIds.includes(creator.id);
        return (
          <Card key={creator.id} testID={`creator-card-${index + 1}`}>
            <SectionTitle>{creator.displayName}</SectionTitle>
            <Tag tone="warning">데모 데이터</Tag>
            <BodyText>
              {ageRangeLabels[creator.profile.ageRange]} · {skinTypeLabels[creator.profile.skinType]} · {creator.profile.concerns.map((concern) => concernLabels[concern]).join(", ")}
            </BodyText>
            <BodyText>사용 제품 {creator.products.length}개</BodyText>
            <BodyText muted>최근 추가 제품: {creator.products[creator.products.length - 1]?.name}</BodyText>
            <BodyText muted>내 프로필과 유사도: {calculateSimilarity(state.profile?.concerns ?? [], creator.profile.concerns)}%</BodyText>
            {creator.feed.map((feed) => (
              <BodyText key={feed}>· {feed}</BodyText>
            ))}
            <Button title="공개 화장대 보기" onPress={() => router.push({ pathname: "/creator/[id]", params: { id: creator.id } })} />
            <Button title={followed ? "팔로우 해제" : "팔로우"} variant="secondary" onPress={() => dispatch({ type: "toggleFollow", creatorId: creator.id })} />
          </Card>
        );
      })}
    </Screen>
  );
}

function calculateSimilarity(myConcerns: string[], creatorConcerns: string[]): number {
  if (myConcerns.length === 0) {
    return 50;
  }
  const overlap = myConcerns.filter((concern) => creatorConcerns.includes(concern)).length;
  return Math.round(50 + (overlap / myConcerns.length) * 50);
}
