package com.ddfinance.core.domain.enums;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for InvestmentType enum.
 * Tests US stock market investment types.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class InvestmentTypeTest {

    @Nested
    @DisplayName("Enum Value Tests")
    class EnumValueTests {

        @Test
        @DisplayName("Should have all required investment types")
        void shouldHaveAllRequiredInvestmentTypes() {
            // Then
            assertThat(InvestmentType.values()).hasSize(6);
            assertThat(InvestmentType.valueOf("STOCK")).isNotNull();
            assertThat(InvestmentType.valueOf("ETF")).isNotNull();
            assertThat(InvestmentType.valueOf("MUTUAL_FUND")).isNotNull();
            assertThat(InvestmentType.valueOf("BOND")).isNotNull();
            assertThat(InvestmentType.valueOf("REIT")).isNotNull();
            assertThat(InvestmentType.valueOf("OTHER")).isNotNull();
        }

        @Test
        @DisplayName("Should have correct display names")
        void shouldHaveCorrectDisplayNames() {
            // Then
            assertThat(InvestmentType.STOCK.getDisplayName()).isEqualTo("Stock");
            assertThat(InvestmentType.ETF.getDisplayName()).isEqualTo("Exchange-Traded Fund");
            assertThat(InvestmentType.MUTUAL_FUND.getDisplayName()).isEqualTo("Mutual Fund");
            assertThat(InvestmentType.BOND.getDisplayName()).isEqualTo("Bond");
            assertThat(InvestmentType.REIT.getDisplayName()).isEqualTo("Real Estate Investment Trust");
            assertThat(InvestmentType.OTHER.getDisplayName()).isEqualTo("Other Investment");
        }

        @Test
        @DisplayName("Should have correct descriptions")
        void shouldHaveCorrectDescriptions() {
            // Then
            assertThat(InvestmentType.STOCK.getDescription()).contains("Individual company shares");
            assertThat(InvestmentType.ETF.getDescription()).contains("basket of securities");
            assertThat(InvestmentType.MUTUAL_FUND.getDescription()).contains("Pooled investment");
            assertThat(InvestmentType.BOND.getDescription()).contains("Fixed income");
            assertThat(InvestmentType.REIT.getDescription()).contains("Real estate");
            assertThat(InvestmentType.OTHER.getDescription()).contains("Alternative investments");
        }

        @Test
        @DisplayName("Should have correct codes")
        void shouldHaveCorrectCodes() {
            // Then
            assertThat(InvestmentType.STOCK.getCode()).isEqualTo("STK");
            assertThat(InvestmentType.ETF.getCode()).isEqualTo("ETF");
            assertThat(InvestmentType.MUTUAL_FUND.getCode()).isEqualTo("MF");
            assertThat(InvestmentType.BOND.getCode()).isEqualTo("BND");
            assertThat(InvestmentType.REIT.getCode()).isEqualTo("REIT");
            assertThat(InvestmentType.OTHER.getCode()).isEqualTo("OTH");
        }
    }

    @Nested
    @DisplayName("Investment Type Property Tests")
    class PropertyTests {

        @Test
        @DisplayName("Should identify tradable types")
        void shouldIdentifyTradableTypes() {
            // Then
            assertThat(InvestmentType.STOCK.isTradable()).isTrue();
            assertThat(InvestmentType.ETF.isTradable()).isTrue();
            assertThat(InvestmentType.MUTUAL_FUND.isTradable()).isTrue();
            assertThat(InvestmentType.BOND.isTradable()).isTrue();
            assertThat(InvestmentType.REIT.isTradable()).isTrue();
            assertThat(InvestmentType.OTHER.isTradable()).isFalse();
        }

        @Test
        @DisplayName("Should identify dividend-paying types")
        void shouldIdentifyDividendPayingTypes() {
            // Then
            assertThat(InvestmentType.STOCK.isCanPayDividends()).isTrue();
            assertThat(InvestmentType.ETF.isCanPayDividends()).isTrue();
            assertThat(InvestmentType.MUTUAL_FUND.isCanPayDividends()).isTrue();
            assertThat(InvestmentType.BOND.isCanPayDividends()).isFalse(); // Bonds pay interest, not dividends
            assertThat(InvestmentType.REIT.isCanPayDividends()).isTrue();
            assertThat(InvestmentType.OTHER.isCanPayDividends()).isFalse();
        }

        @Test
        @DisplayName("Should identify fractional share support")
        void shouldIdentifyFractionalShareSupport() {
            // Then
            assertThat(InvestmentType.STOCK.isSupportsFractionalShares()).isTrue();
            assertThat(InvestmentType.ETF.isSupportsFractionalShares()).isTrue();
            assertThat(InvestmentType.MUTUAL_FUND.isSupportsFractionalShares()).isTrue();
            assertThat(InvestmentType.BOND.isSupportsFractionalShares()).isFalse();
            assertThat(InvestmentType.REIT.isSupportsFractionalShares()).isTrue();
            assertThat(InvestmentType.OTHER.isSupportsFractionalShares()).isFalse();
        }
    }

    @Nested
    @DisplayName("Utility Method Tests")
    class UtilityMethodTests {

        @Test
        @DisplayName("Should find investment type by code")
        void shouldFindInvestmentTypeByCode() {
            // Then
            assertThat(InvestmentType.fromCode("STK")).isEqualTo(InvestmentType.STOCK);
            assertThat(InvestmentType.fromCode("ETF")).isEqualTo(InvestmentType.ETF);
            assertThat(InvestmentType.fromCode("MF")).isEqualTo(InvestmentType.MUTUAL_FUND);
            assertThat(InvestmentType.fromCode("BND")).isEqualTo(InvestmentType.BOND);
            assertThat(InvestmentType.fromCode("REIT")).isEqualTo(InvestmentType.REIT);
            assertThat(InvestmentType.fromCode("OTH")).isEqualTo(InvestmentType.OTHER);
        }

        @Test
        @DisplayName("Should return null for invalid code")
        void shouldReturnNullForInvalidCode() {
            // Then
            assertThat(InvestmentType.fromCode("INVALID")).isNull();
            assertThat(InvestmentType.fromCode("")).isNull();
            assertThat(InvestmentType.fromCode(null)).isNull();
        }

        @Test
        @DisplayName("Should get all tradable types")
        void shouldGetAllTradableTypes() {
            // When
            var tradableTypes = InvestmentType.getTradableTypes();

            // Then
            assertThat(tradableTypes).hasSize(5);
            assertThat(tradableTypes).contains(
                InvestmentType.STOCK,
                InvestmentType.ETF,
                InvestmentType.MUTUAL_FUND,
                InvestmentType.BOND,
                InvestmentType.REIT
            );
            assertThat(tradableTypes).doesNotContain(InvestmentType.OTHER);
        }

        @Test
        @DisplayName("Should get all dividend-paying types")
        void shouldGetAllDividendPayingTypes() {
            // When
            var dividendTypes = InvestmentType.getDividendPayingTypes();

            // Then
            assertThat(dividendTypes).hasSize(4);
            assertThat(dividendTypes).contains(
                InvestmentType.STOCK,
                InvestmentType.ETF,
                InvestmentType.MUTUAL_FUND,
                InvestmentType.REIT
            );
            assertThat(dividendTypes).doesNotContain(InvestmentType.BOND, InvestmentType.OTHER);
        }
    }

    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should return display name for toString")
        void shouldReturnDisplayNameForToString() {
            // Then
            assertThat(InvestmentType.STOCK.toString()).isEqualTo("Stock");
            assertThat(InvestmentType.ETF.toString()).isEqualTo("Exchange-Traded Fund");
            assertThat(InvestmentType.MUTUAL_FUND.toString()).isEqualTo("Mutual Fund");
        }
    }
}