import { Rule } from "@dashboard/discounts/models";
import { DiscoutFormData } from "@dashboard/discounts/types";
import { useLabelMapsContext } from "@dashboard/discounts/views/DiscountDetails/context/context";
import {
  PromotionDetailsFragment,
  PromotionRuleCreateErrorFragment,
  PromotionRuleUpdateErrorFragment,
  PromotionTypeEnum,
} from "@dashboard/graphql";
import { splitDateTime } from "@dashboard/misc";
import { CommonError } from "@dashboard/utils/errors/common";
import { RichTextContext } from "@dashboard/utils/richText/context";
import useRichText from "@dashboard/utils/richText/useRichText";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { getValidationSchema } from "../DiscountCreateForm/validationSchema";
import { useRulesHandlers } from "./hooks/useRulesHandlers";

interface DiscountDetailsFormRenderProps {
  rulesErrors: Array<CommonError<any>>;
  rules: Rule[];
  discountType: PromotionTypeEnum;
  onSubmit: () => void;
  onRuleSubmit: (rule: Rule, ruleEditIndex: number | null) => Promise<void>;
  onDeleteRule: (ruleDeleteIndex: number) => Promise<void>;
}

interface DiscountDetailsFormProps {
  children: (renderProps: DiscountDetailsFormRenderProps) => ReactNode;
  disabled: boolean;
  data: PromotionDetailsFragment | undefined | null;
  onSubmit: (data: DiscoutFormData) => void;
  onRuleUpdateSubmit: (data: Rule) => Promise<Array<CommonError<PromotionRuleUpdateErrorFragment>>>;
  onRuleCreateSubmit: (data: Rule) => Promise<Array<CommonError<PromotionRuleCreateErrorFragment>>>;
  onRuleDeleteSubmit: (id: string) => void;
}

export const DiscountDetailsForm = ({
  children,
  data,
  disabled,
  onSubmit,
  onRuleCreateSubmit,
  onRuleDeleteSubmit,
  onRuleUpdateSubmit,
}: DiscountDetailsFormProps) => {
  const intl = useIntl();
  const methods = useForm<DiscoutFormData>({
    mode: "onBlur",
    values: {
      type: data?.type ?? PromotionTypeEnum.CATALOGUE,
      dates: {
        startDate: splitDateTime(data?.startDate ?? "").date,
        startTime: splitDateTime(data?.startDate ?? "").time,
        endDate: splitDateTime(data?.endDate ?? "").date,
        endTime: splitDateTime(data?.endDate ?? "").time,
        hasEndDate: !!data?.endDate,
      },
      name: data?.name ?? "",
      description: data?.description ? JSON.stringify(data.description) : "",
      rules: [],
    },
    resolver: zodResolver(getValidationSchema(intl)),
  });
  const discountType = methods.watch("type");
  const richText = useRichText({
    initial: JSON.stringify(data?.description),
    loading: disabled,
    triggerChange: methods.trigger,
  });
  const handleSubmit = methods.handleSubmit(onSubmit);
  const { ruleConditionsValues, gifts } = useLabelMapsContext();
  const { onDeleteRule, onRuleSubmit, rules, rulesErrors } = useRulesHandlers({
    data,
    onRuleCreateSubmit,
    onRuleDeleteSubmit,
    onRuleUpdateSubmit,
    ruleConditionsOptionsDetailsMap: ruleConditionsValues.labels,
    giftsOptionsDetailsMap: gifts.labels,
  });

  return (
    <RichTextContext.Provider value={richText}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} data-test-id="discount-form">
          {children({
            rulesErrors,
            rules,
            discountType,
            onSubmit: handleSubmit,
            onRuleSubmit,
            onDeleteRule,
          })}
        </form>
      </FormProvider>
    </RichTextContext.Provider>
  );
};
