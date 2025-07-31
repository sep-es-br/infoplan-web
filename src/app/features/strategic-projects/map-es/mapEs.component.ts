import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IIdAndName, StrategicProjectsLocalidades } from '../../../core/interfaces/id-and-name.interface';
import { Region } from '../../../core/interfaces/map-es.interface';
import { NbThemeService } from '@nebular/theme';
import { AvailableThemes } from '../../../@theme/theme.module';
import { StrategicProjectsFilter } from '../strategicProjects.component';

@Component({
  selector: 'ngx-map-es',
  styleUrls: ['./mapEs.component.scss'],
  template: `
    <div class="container d-flex flex-column">
      <div class="d-flex justify-content-end py-2">
        <nb-icon
          class="m-0 p-0 reset-filter"
          [icon]="'refresh-outline'"
          nbTooltip="Redefinir Filtros"
          (click)="handleResetFilters()"
        >
        </nb-icon>
      </div>
      <div class="mapa-es" [innerHTML]="svgSeguro"></div>
    </div>
  `,
})
export class MapEsComponent implements OnInit, OnChanges {
  @Input() filter: StrategicProjectsFilter;

  @Input() localidadeList!: StrategicProjectsLocalidades[];

  @Output() filterChange = new EventEmitter<any>();

  regioes = {
    Todas_as_Localidades: '#AAAAAA',
    Todo_o_Estado: '#4EA3BB',
    Metropolitana: '#FFAA00', // Região Metropolitana da Grande Vitória
    Central_Serrana: '#0477BF', // Central Serrana
    Sudoeste_Serrana: '#FF6B1A', // Sudoeste Serrana
    Litoral_Sul: '#A3AB78', // Litoral Sul
    Central_Sul: '#C73838', // Centro Sul
    Caparaó: '#589A8D', // Caparaó
    Rio_Doce: '#026E5B', // Rio Doce
    Centro_Oeste: '#A36717', // Centro-Oeste
    Nordeste: '#B33F00', // Nordeste
    Noroeste: '#6A33AB', // Noroeste
  };

  regioesArray = Object.keys(this.regioes).map((nome) => {
    const nomeComEspacos = nome.replace(/_/g, ' ');
    return { nome: nomeComEspacos, cor: this.regioes[nome] };
  });

  regionCities: { [key: string]: Region } = {
    Todo_o_Estado: {
      name: 'Todo o Estado',
      active: false,
      cities: [
        { code: 'TEstado', name: 'Todo o Estado', active: false },
      ],
    },
    Metropolitana: {
      name: 'Metropolitana',
      active: false,
      cities: [
        { code: '3201308', name: 'Cariacica', active: false },
        { code: '3205002', name: 'Serra', active: false },
        { code: '3205101', name: 'Viana', active: false },
        { code: '3205309', name: 'Vitória', active: false },
        { code: '3205200', name: 'Vila Velha', active: false },
        { code: '3202207', name: 'Fundão', active: false },
        { code: '3202405', name: 'Guarapari', active: false },
      ],
    },
    Central_Serrana: {
      name: 'Central Serrana',
      active: false,
      cities: [
        { code: '3202702', name: 'Itaguaçu', active: false },
        { code: '3202900', name: 'Itarana', active: false },
        { code: '3204500', name: 'Santa Leopoldina', active: false },
        { code: '3204559', name: 'Santa Maria de Jetibá', active: false },
        { code: '3204609', name: 'Santa Teresa', active: false },
      ],
    },
    Sudoeste_Serrana: {
      name: 'Sudoeste Serrana',
      active: false,
      cities: [
        { code: '3200102', name: 'Afonso Cláudio', active: false },
        { code: '3201159', name: 'Brejetuba', active: false },
        { code: '3201704', name: 'Conceição do Castelo', active: false },
        { code: '3201902', name: 'Domingos Martins', active: false },
        { code: '3203163', name: 'Laranja da Terra', active: false },
        { code: '3203346', name: 'Marechal Floriano', active: false },
        { code: '3205069', name: 'Venda Nova do Imigrante', active: false },
      ],
    },
    Litoral_Sul: {
      name: 'Litoral Sul',
      active: false,
      cities: [
        { code: '3200300', name: 'Alfredo Chaves', active: false },
        { code: '3200409', name: 'Anchieta', active: false },
        { code: '3202603', name: 'Iconha', active: false },
        { code: '3204203', name: 'Piúma', active: false },
        { code: '3202801', name: 'Itapemirim', active: false },
        { code: '3204401', name: 'Rio Novo do Sul', active: false },
        { code: '3203320', name: 'Marataízes', active: false },
        { code: '3204302', name: 'Presidente Kennedy', active: false },
      ],
    },
    Central_Sul: {
      name: 'Central Sul',
      active: false,
      cities: [
        { code: '3201209', name: 'Cachoeiro de Itapemirim', active: false },
        { code: '3205036', name: 'Vargem Alta', active: false },
        { code: '3201407', name: 'Castelo', active: false },
        { code: '3200706', name: 'Atílio Vivacqua', active: false },
        { code: '3203403', name: 'Mimoso do Sul', active: false },
        { code: '3203809', name: 'Muqui', active: false },
        { code: '3200508', name: 'Apiacá', active: false },
      ],
    },
    Caparaó: {
      name: 'Caparaó',
      active: false,
      cities: [
        { code: '3203106', name: 'Jerônimo Monteiro', active: false },
        { code: '3201803', name: 'Divino de São Lourenço', active: false },
        { code: '3202009', name: 'Dores do Rio Preto', active: false },
        { code: '3202306', name: 'Guaçuí', active: false },
        { code: '3202553', name: 'Ibitirama', active: false },
        { code: '3203700', name: 'Muniz Freire', active: false },
        { code: '3202652', name: 'Irupi', active: false },
        { code: '3204807', name: 'São José do Calçado', active: false },
        { code: '3200201', name: 'Alegre', active: false },
        { code: '3201100', name: 'Bom Jesus do Norte', active: false },
        { code: '3203007', name: 'Iúna', active: false },
        { code: '3202454', name: 'Ibatiba', active: false },
      ],
    },
    Rio_Doce: {
      name: 'Rio Doce',
      active: false,
      cities: [
        { code: '3200607', name: 'Aracruz', active: false },
        { code: '3202504', name: 'Ibiraçu', active: false },
        { code: '3203130', name: 'João Neiva', active: false },
        { code: '3203205', name: 'Linhares', active: false },
        { code: '3204351', name: 'Rio Bananal', active: false },
        { code: '3205010', name: 'Sooretama', active: false },
      ],
    },
    Centro_Oeste: {
      name: 'Centro Oeste',
      active: false,
      cities: [
        { code: '3200359', name: 'Alto Rio Novo', active: false },
        { code: '3200805', name: 'Baixo Guandu', active: false },
        { code: '3201506', name: 'Colatina', active: false },
        { code: '3204005', name: 'Pancas', active: false },
        { code: '3202256', name: 'Governador Lindenberg', active: false },
        { code: '3203353', name: 'Marilândia', active: false },
        { code: '3204658', name: 'São Domingos do Norte', active: false },
        { code: '3204708', name: 'São Gabriel da Palha', active: false },
        { code: '3205176', name: 'Vila Valério', active: false },
        { code: '3204955', name: 'São Roque do Canaã', active: false },
      ],
    },
    Nordeste: {
      name: 'Nordeste',
      active: false,
      cities: [
        { code: '3201605', name: 'Conceição da Barra', active: false },
        { code: '3204054', name: 'Pedro Canário', active: false },
        { code: '3204906', name: 'São Mateus', active: false },
        { code: '3203502', name: 'Montanha', active: false },
        { code: '3203601', name: 'Mucurici', active: false },
        { code: '3204104', name: 'Pinheiros', active: false },
        { code: '3204252', name: 'Ponto Belo', active: false },
        { code: '3203056', name: 'Jaguaré', active: false },
        { code: '3201001', name: 'Boa Esperança', active: false },
      ],
    },
    Noroeste: {
      name: 'Noroeste',
      active: false,
      cities: [
        { code: '3200169', name: 'Água Doce do Norte', active: false },
        { code: '3200904', name: 'Barra de São Francisco', active: false },
        { code: '3202108', name: 'Ecoporanga', active: false },
        { code: '3203304', name: 'Mantenópolis', active: false },
        { code: '3205150', name: 'Vila Pavão', active: false },
        { code: '3200136', name: 'Águia Branca', active: false },
        { code: '3203908', name: 'Nova Venécia', active: false },
      ],
    },
  };

  svgSeguro: SafeHtml;

  standardUnselectedPathOpacity = '0.25';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private themeService: NbThemeService,
  ) {
    this.themeService.onThemeChange().subscribe(() => {
      setTimeout(() => this.alterStylesBasedOnTheme(), 0);
    });
  }

  ngOnInit(): void {
    this.carregarSvg();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.atualizarEstadosComBaseNoFilter();
    }
  }

carregarSvg(): void {
  this.http.get('/assets/images/app/mapa-es.svg', { responseType: 'text' }).subscribe(
    (svg: string) => {
      const svgColorido = this.aplicarCores(svg);
      this.svgSeguro = this.sanitizer.bypassSecurityTrustHtml(svgColorido);
      this.verificarSvgRenderizado(); // <- move para cá
    },
    (error) => {
      console.error('Erro ao carregar o SVG:', error);
    },
  );
}

verificarSvgRenderizado(): void {
  const intervalo = 100;
  const tempoMaximo = 5000;
  const inicio = Date.now();

  const loop = () => {
    const svgElement = document.querySelector('.mapa-es svg');

    if (svgElement) {
      this.atualizarEstadosComBaseNoFilter();
      setTimeout(() => this.adicionarEfeitos(), 0); // Só depois de atualizar o estado
    } else if (Date.now() - inicio < tempoMaximo) {
      setTimeout(loop, intervalo);
    } else {
      console.warn('O SVG não foi renderizado dentro do tempo esperado.');
    }
  };

  loop();
}

  atualizarEstadosComBaseNoFilter(): void {
    const svgElement = document.querySelector('.mapa-es svg');
    if (!svgElement) return;

    // Inicia por percorrer todas as regiões e cidades e setando active = true caso estejam inclusas no filtro.
    
    Object.values(this.regionCities).forEach((region) => {
      const regionId = this.localidadeList.find((el) => el.name === region.name).id;
      region.active = this.filter.localidades?.includes(regionId);
      region.cities.forEach((city) => {
        const cityId = this.localidadeList.find((el) => el.name === city.name)?.id;
        city.active = this.filter.localidades?.includes(cityId);
      });
    });

    const microrregioesPaths = [];
    const municipiosPaths = [];

    const paths = svgElement.querySelectorAll('path');
    paths.forEach((path: SVGPathElement) => {
      const pathId = path.getAttribute('id');
      // const grupoCorrespondente = svgElement.querySelector(`g[id="${pathId}"]`) as SVGGElement | null;
      const textoDiretoCorrespondente = svgElement.querySelectorAll(`text[id="${pathId}"]`) as NodeListOf<SVGTextElement | null>;
      const municipio = Object.values(this.regionCities)
        .flatMap((region) => region.cities)
        .find((city) => city.code === pathId);

      if (municipio) {
        // O path atual é referente a um município
        municipiosPaths.push(path);
        path.setAttribute('fill-opacity', municipio.active ? '1' : '0.25');

        // if (grupoCorrespondente) {
        //   grupoCorrespondente.classList.toggle('hover-effect', municipio.active);
        // }
        path.classList.toggle('hover-effect', municipio.active);

        if (textoDiretoCorrespondente) {
          textoDiretoCorrespondente.forEach((text) => {
            text.style.fontWeight = municipio.active ? 'bold' : 'normal';
          });
        }
      } else if (Object.keys(this.regionCities).includes(pathId)) {
        // O path atual é referente a uma região
        microrregioesPaths.push(path);
        const currentRegion = this.regionCities[pathId];
        path.setAttribute('fill-opacity', currentRegion.active ? '1' : '0.25');
        path.classList.toggle('hover-effect', currentRegion.active);

        // if (grupoCorrespondente) {
        //   grupoCorrespondente.classList.toggle('hover-effect', currentRegion.active);
        //   grupoCorrespondente.setAttribute('fill-opacity', currentRegion.active ? '1' : '0.25');
        // }

        if (textoDiretoCorrespondente) {
          textoDiretoCorrespondente.forEach((text) => {
            text.style.fontWeight = currentRegion.active ? 'bold' : 'normal';
          });
        }
      }
    });

    // Aqui é necessário criar um procedimento especial pros textos "Microrregiões" e "Municípios"
    const microrregioesText = svgElement.querySelector('text[id="Microrregiões"]') as SVGTextElement;
    const municipiosText = svgElement.querySelector('text[id="Municípios"]') as SVGTextElement;
    
    const areAllRegionsActive = Object.keys(this.regionCities).every((prop) => this.regionCities[prop].active);
    const areAllCitiesActive = Object.keys(this.regionCities).every((prop) => this.regionCities[prop].cities.every((city) => city.active));
    microrregioesText.style.fontWeight = areAllRegionsActive ? 'bold' : 'normal';
    municipiosText.style.fontWeight = areAllCitiesActive ? 'bold' : 'normal';

    this.alterStylesBasedOnTheme();
  }

  aplicarCores(svg: string): string {
    Object.keys(this.regionCities).forEach((regionKey) => {
      const region = this.regionCities[regionKey];
      const color = this.regioes[regionKey];

      // Aplica as cores em todos os municípios no Mapa de Municípios
      region.cities.forEach((city) => {
        svg = svg.replace(
          `id="${city.code}"`,
          `id="${city.code}" fill="${color}" fill-opacity="${this.standardUnselectedPathOpacity}"`
        );
      });

      // Aplica as cores em todas as regiões no Mapa de Regiões
     const patternRegion = new RegExp(`<path([^>]*?)id=["']${regionKey}["']`, 'g');
      svg = svg.replace(
        patternRegion,
        `<path fill="${color}" fill-opacity="${this.standardUnselectedPathOpacity}"$1 id="${regionKey}"`
      );
    });

    return svg;
  }

  adicionarEfeitos(): void {
    setTimeout(() => {
      const svgElement = document.querySelector('.mapa-es svg');

      if (svgElement) {
        const municipiosList = Object.values(this.regionCities).flatMap((region) => region.cities);
        const paths = svgElement.querySelectorAll('path');

        const regionsPaths = [];
        const municipiosPaths = [];
        const bothTexts = [];

        paths.forEach((path: SVGPathElement) => {
          const municipio = municipiosList.find((city) => city.code === path.id);
          let pathEntity: { name: string; active: boolean; };

          // const grupoCorrespondente = svgElement.querySelector(`g[id="${path.id}"]`) as SVGGElement | null;
          const textoDiretoCorrespondente = svgElement.querySelectorAll(`text[id="${path.id}"]`) as NodeListOf<SVGTextElement | null>;

          path.removeAllListeners();

          const toggleAtivo = () => {
            pathEntity.active = !pathEntity.active;
            const localidade = this.localidadeList.find((item) => item.name === pathEntity.name);

            if (pathEntity.active) {
              // Clicou pra selecionar o município/região
              if (this.filter.localidades && !this.filter.localidades.includes(localidade.id)) {
                this.filter.localidades.push(localidade.id);
              } else if (!this.filter.localidades) {
                this.filter = {
                  ...this.filter,
                  localidades: [
                    localidade.id,
                  ],
                };
              }
            } else {
              // Clicou pra de-selecionar o município/região
              this.filter.localidades = this.filter.localidades.filter((el: number) => el !== localidade.id);
            }

            this.atualizarEstadosComBaseNoFilter();
            this.filterChange.emit(this.filter);
          };

          const actionsOnMouseEvent = (opacityLevel: string, newTextWeight: 'normal' | 'bold', hoverEffectAction?: 'add' | 'remove') => {
            if (!pathEntity.active) {
              path.setAttribute('fill-opacity', opacityLevel);
              if (hoverEffectAction) {
                if (hoverEffectAction === 'add') {
                  path.classList.add('hover-effect');
                } else if (hoverEffectAction === 'remove') {
                  path.classList.remove('hover-effect');
                }
              }
              if (textoDiretoCorrespondente) {
                textoDiretoCorrespondente.forEach((text) => {
                  text.style.fontWeight = newTextWeight;
                });
              }
            }
          };

          if (municipio) {
            municipiosPaths.push(path);
            pathEntity = municipio;

            path.setAttribute('fill-opacity', pathEntity.active ? '1' : this.standardUnselectedPathOpacity);
            path.style.cursor = 'pointer';
            path.style.transition = 'fill-opacity 0.3s ease';

            path.addEventListener('click', toggleAtivo);
            path.addEventListener('mouseenter', () => actionsOnMouseEvent('1', 'bold', 'add'));
            path.addEventListener('mouseleave', () => actionsOnMouseEvent(this.standardUnselectedPathOpacity, 'normal', 'remove'));
          } else {
            regionsPaths.push(path);
            pathEntity = this.regionCities[path.id];

            path.setAttribute('fill-opacity', pathEntity.active ? '1' : this.standardUnselectedPathOpacity);
            path.style.cursor = 'pointer';
            path.style.transition = 'fill-opacity 0.3s ease';

            path.addEventListener('mouseenter', () => actionsOnMouseEvent('1', 'bold', 'add'));
            path.addEventListener('mouseleave', () => actionsOnMouseEvent(this.standardUnselectedPathOpacity, 'normal', 'remove'));
            path.addEventListener('click', toggleAtivo);
          }

          if (textoDiretoCorrespondente) {
            bothTexts.push(textoDiretoCorrespondente);
            textoDiretoCorrespondente.forEach((text) => {
              text.style.cursor = 'pointer';
              text.addEventListener('mouseenter', () => actionsOnMouseEvent('1', 'bold'));
              text.addEventListener('mouseleave', () => actionsOnMouseEvent(this.standardUnselectedPathOpacity, 'normal'));
              if (!text.eventListeners().map((evt: EventListener) => evt.name).includes('toggleAtivo')) {
                text.addEventListener('click', toggleAtivo);
              }
            });
          }
        });

        // Aqui precisa fazer um procedimento específico pros textos de "Microrregiões" e "Municípios"
        const microrregioesText = svgElement.querySelector('text[id="Microrregiões"]') as SVGTextElement;
        const municipiosText = svgElement.querySelector('text[id="Municípios"]') as SVGTextElement;

        // Quando passar o cursor em cima do texto "Microrregiões", deve mostrar o cursor como pointer,
        // e deve destacar todas as microrregiões.
        microrregioesText.style.cursor = 'pointer';
        microrregioesText.addEventListener('mouseover', () => {
          Object.keys(this.regionCities)
            .filter((region) => region !== 'Todo_o_Estado')
            .forEach((region) => {
              const regionPath = regionsPaths.find((path) => path.id === region);
              if (regionPath && !this.regionCities[region].active) {
                regionPath.setAttribute('fill-opacity', 1);
                regionPath.classList.add('hover-effect');
                const regionTexts = bothTexts.filter((texts) => texts.id === region);
                
                if (regionTexts) {
                  regionTexts.forEach((text) => text.style.fontWeight = 'bold');
                }
              }
            });
        });

        microrregioesText.addEventListener('mouseleave', () => {
          Object.keys(this.regionCities)
            .filter((region) => region !== 'Todo_o_Estado')
            .forEach((region) => {
              const regionPath = regionsPaths.find((path) => path.id === region);
              if (regionPath && !this.regionCities[region].active) {
                regionPath.setAttribute('fill-opacity', this.standardUnselectedPathOpacity);
                regionPath.classList.remove('hover-effect');
                const regionTexts = bothTexts.filter((texts) => texts.id === region);

                if (regionTexts) {
                  regionTexts.forEach((text) => text.style.fontWeight = 'normal');
                }
              }
            });
        });

        microrregioesText.addEventListener('click', () => {
          if (!this.filter.localidades) this.filter.localidades = [];
          
          const areAllRegionsSelected = Object.keys(this.regionCities)
            .filter((region) => region !== 'Todo_o_Estado')
            .every((region) => this.regionCities[region].active);

          if (areAllRegionsSelected) {
            // Todas as microrregiões já estão selecionadas, então precisa de-selecioná-las
            const currentlySelectedLocalidades = this.localidadeList.filter((local) => this.filter.localidades?.includes(local.id));
            this.filter.localidades = currentlySelectedLocalidades.filter((local) => local.tipo !== "MICRORREGIÃO").map((local) => local.id);
            microrregioesText.style.fontWeight = 'normal';
          } else {
            // Precisa selecionar todas as microrregiões
            const missingLocalidades = this.localidadeList.filter((local) => local.tipo === "MICRORREGIÃO" && !this.filter.localidades?.includes(local.id));
            this.filter.localidades = [
              ...this.filter?.localidades,
              ...missingLocalidades.map((local) => local.id),
            ];
            microrregioesText.style.fontWeight = 'bold';
          }

          this.atualizarEstadosComBaseNoFilter();
          this.filterChange.emit(this.filter);
        });

        municipiosText.style.cursor = 'pointer';
        municipiosText.addEventListener('mouseover', () => {
          Object.keys(this.regionCities)
            .filter((region) => region !== 'Todo_o_Estado')
            .flatMap((region) => this.regionCities[region].cities)
            .forEach((city) => {
              const cityPath = municipiosPaths.find((path) => path.id === city.code);
              if (cityPath && !city.active) {
                cityPath.setAttribute('fill-opacity', 1);
                cityPath.classList.add('hover-effect');
                const cityTexts = bothTexts.filter((texts) => texts.id === city.code);

                if (cityTexts) {
                  cityTexts.forEach((text) => text.style.fontWeight = 'bold');
                }
              }
            })
          });

        municipiosText.addEventListener('mouseleave', () => {
          Object.keys(this.regionCities)
            .filter((region) => region !== 'Todo_o_Estado')
            .flatMap((region) => this.regionCities[region].cities)
            .forEach((city) => {
              const cityPath = municipiosPaths.find((path) => path.id === city.code);
              if (cityPath && !city.active) {
                cityPath.setAttribute('fill-opacity', this.standardUnselectedPathOpacity);
                cityPath.classList.remove('hover-effect');
                const cityTexts = bothTexts.filter((texts) => texts.id === city.code);

                if (cityTexts) {
                  cityTexts.forEach((text) => text.style.fontWeight = 'normal');
                }
              }
            });
        });

        municipiosText.addEventListener('click', () => {
          if (!this.filter.localidades) this.filter.localidades = [];

          const citiesList = Object.keys(this.regionCities)
            .filter((region) => region !== 'Todo_o_Estado')
            .flatMap((region) => this.regionCities[region].cities);

          if (citiesList.every((city) => city.active)) {
            // Todas os municípios estão selecionados, então precisa de-selecioná-los
            const currentlySelectedLocalidades = this.localidadeList.filter((local) => this.filter.localidades?.includes(local.id));
            this.filter.localidades = currentlySelectedLocalidades.filter((local) => local.tipo !== "MUNICÍPIO").map((local) => local.id);
            municipiosText.style.fontWeight = 'normal';
          } else {
            // Precisa selecionar todos os municípios
            const missingLocalidades = this.localidadeList.filter((local) => local.tipo === "MUNICÍPIO" && !this.filter.localidades?.includes(local.id));
            this.filter.localidades = [
              ...this.filter?.localidades,
              ...missingLocalidades.map((local) => local.id),
            ];
            municipiosText.style.fontWeight = 'bold';
          }

          this.atualizarEstadosComBaseNoFilter();
          this.filterChange.emit(this.filter);
        });
      }
    }, 0);
  }  

  alterStylesBasedOnTheme() {
    const currentTheme = this.themeService.currentTheme;

    /*
    * Caso seja aplicado um tema escuro, deve diminuir a grossura do contorno dos municípios,
    * e trocar a cor do nome dos municípios para branco, para melhorar a visualização.
    * Caso seja aplicado um tema claro, deve alterar as propriedades para seus valores originais.
    */
    const svgElement = document.querySelector('.mapa-es svg');
    if (!svgElement) return;

    // Seleciona todas as tags <path> do svg
    const paths = svgElement.querySelectorAll('path');
    paths.forEach((path: SVGPathElement) => {
      if (currentTheme === AvailableThemes.DARK || currentTheme === AvailableThemes.COSMIC) {
        path.setAttribute('stroke-width', '0.6');
        path.setAttribute('stroke', '#FFFFFF');
      } else if (currentTheme === AvailableThemes.DEFAULT) {
        path.setAttribute('stroke-width', '0.6');
        path.setAttribute('stroke', '#000000')
      }
    });

    // Seleciona todas as tags <text> do svg
    const texts = svgElement.querySelectorAll('text');
    texts.forEach((text: SVGTextElement) => {
      if (currentTheme === AvailableThemes.DARK || currentTheme === AvailableThemes.COSMIC) {
        text.setAttribute('fill', '#FFFFFF');
      } else if (currentTheme === AvailableThemes.DEFAULT) {
        text.setAttribute('fill', '#000000');
      }
    });
  }

  handleResetFilters() {
    this.filter.localidades = [];
    this.filterChange.emit(this.filter);
    this.atualizarEstadosComBaseNoFilter();
  }
}
